"""
Format parser for DIPG Safety Gym responses.

Supports multiple input formats (JSON, XML, YAML, custom tags) and normalizes
them to a common internal representation for evaluation.

The V3 hierarchical curriculum reward logic remains unchanged - this is purely
a normalization layer.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator, ValidationError
import json
import yaml
import xml.etree.ElementTree as ET
import re
from enum import Enum

# Import ParsedResponse from standalone library
from med_safety_eval.models import ParsedResponse as DIPGResponse

class ResponseFormat(str, Enum):
    """Supported response formats"""
    JSON = "json"
    XML = "xml"
    YAML = "yaml"
    CUSTOM_TAGS = "custom_tags"
    AUTO = "auto"


class FormatParser:
    """
    Parses DIPG Safety responses in multiple formats.
    
    Supports:
    - JSON: {"analysis": "...", "proof": "...", "final": "..."}
    - XML: <dipg_response><analysis>...</analysis>...</dipg_response>
    - YAML: analysis: ...\nproof: ...\nfinal: ...
    - Custom Tags: <|channel|>analysis<|message|>...<|end|>...
    """
    
    def __init__(self):
        # XML Tag Config (Synced with med_safety_eval)
        self.tag_aliases = {
            "analysis": ["think", "analysis", "reasoning", "thought"],
            "proof": ["proof", "trace", "evidence", "quote"],
            "final": ["answer", "final", "conclusion", "result", "final_answer"],
        }
        self.tag_pattern_template = r"<(?:{tags})(?:\s+[^>]*)?>(.*?)</(?:{tags})>"
        
        # Pre-compile patterns
        self.tag_patterns = {
            key: re.compile(
                self.tag_pattern_template.format(tags='|'.join(re.escape(a) for a in aliases)),
                re.DOTALL | re.IGNORECASE
            )
            for key, aliases in self.tag_aliases.items()
        }
        
        # Fallback for missing answer tag
        all_other_aliases = []
        for key, aliases in self.tag_aliases.items():
            if key != "final":
                all_other_aliases.extend(aliases)
        self.fallback_closing_tag_pattern = re.compile(
            rf"</(?:{'|'.join(re.escape(a) for a in all_other_aliases)})>", 
            re.IGNORECASE
        )

        # Regex pattern for custom tag format
        self.custom_tag_pattern = re.compile(
            r'<\|channel\|>(\w+)<\|message\|>(.*?)<\|end\|>',
            re.DOTALL
        )
    
    def parse(
        self,
        response: str,
        format_type: ResponseFormat = ResponseFormat.AUTO
    ) -> DIPGResponse:
        """
        Parse response in any supported format.
        """
        if not response or not response.strip():
            return DIPGResponse(
                final="FORMAT_ERROR: Empty response",
                original_response=response,
            )

        if format_type == ResponseFormat.AUTO:
            format_type = self._detect_format(response)

        if format_type == ResponseFormat.CUSTOM_TAGS:
            return self._parse_custom_tags(response, original_response=response)
        elif format_type == ResponseFormat.XML:
            return self._parse_xml(response, original_response=response)
        elif format_type == ResponseFormat.JSON:
            return self._parse_json(response, original_response=response)
        elif format_type == ResponseFormat.YAML:
            return self._parse_yaml(response, original_response=response)
        
        # Fallback to XML
        return self._parse_xml(response, original_response=response)
    
    def _detect_format(self, response: str) -> ResponseFormat:
        """Auto-detect the format of the response"""
        response_stripped = response.strip()
        
        
        # Check for Custom Tags (distinctive markers) - Prioritize this!
        if '<|channel|>' in response_stripped:
            return ResponseFormat.CUSTOM_TAGS

        # Check for JSON (starts with { or wrapped in markdown)
        if response_stripped.startswith('{') or '```json' in response_stripped.lower() or (response_stripped.startswith('```') and '{' in response_stripped):
            return ResponseFormat.JSON
        
        # Check for XML (starts with < and contains closing tags)
        # Relaxed check: Simply looking for plausible XML structure
        # We now check for closing tags anywhere, handling preamble text
        if '</' in response_stripped and '>' in response_stripped:
             # Basic heuristic: if it has tags, it's likely XML
             # This covers standard LLM output like <think>...</think>
             return ResponseFormat.XML
        
        # Fallback check for startup tags if closing tags are missing (rare but possible)
        # But we must ensure it's not actually custom tags (already checked above)
        if response_stripped.startswith('<') and '>' in response_stripped:
             return ResponseFormat.XML

        
        # Check for YAML (has key: value structure for required fields)
        if all(field in response_stripped for field in ['analysis:', 'proof:', 'final:']) or '```yaml' in response_stripped.lower():
            return ResponseFormat.YAML
        
        # Default to custom tags for backward compatibility
        return ResponseFormat.CUSTOM_TAGS
    
    def _parse_json(self, response: str, original_response: str = "") -> DIPGResponse:
        """Parse JSON format with robustness improvements"""
        cleaned_response = response.strip()
        
        # 1. Strip markdown code blocks (handles text before/after blocks)
        if '```' in cleaned_response:
            # Find content between first ``` and last ```
            # This handles cases like: "Here's the answer: ```json {...} ``` Hope this helps!"
            first_backtick = cleaned_response.find('```')
            last_backtick = cleaned_response.rfind('```')
            
            if first_backtick != -1 and last_backtick != -1 and first_backtick < last_backtick:
                # Extract content between the outermost backticks and strip the language specifier
                content_block = cleaned_response[first_backtick + 3 : last_backtick]
                cleaned_response = re.sub(r'^\w*\s*', '', content_block).strip()
            
        try:
            data = json.loads(cleaned_response)
            
            # 2. Normalize field aliases
            normalized_data = {}
            
            # Define aliases
            aliases = {
                'analysis': ['reasoning', 'thought', 'thoughts', 'explanation', 'analysis'],
                'proof': ['evidence', 'quote', 'reference', 'source', 'proof'],
                'final': ['answer', 'conclusion', 'result', 'final_answer', 'final']
            }
            
            # Map fields
            for target_field, source_fields in aliases.items():
                for source in source_fields:
                    if source in data:
                        normalized_data[target_field] = data[source]
                        break
                # If not found, default to empty string
                if target_field not in normalized_data:
                     normalized_data[target_field] = ""
            
            return DIPGResponse(original_response=original_response, **normalized_data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {e}")
        except ValidationError as e:
            raise ValueError(f"JSON validation failed: {e}")
    
    def _parse_xml(self, response: str, original_response: str = "") -> DIPGResponse:
        """Parse XML-like format using Robust Regex (ignore strict XML rules)"""
        # We use regex to be resilient to malformed XML, attributes, or fragments
        cleaned_response = response.strip()

        # 1. Extract analysis (thought) from the original text (first match)
        analysis_prog = self.tag_patterns["analysis"]
        analysis_match = analysis_prog.search(cleaned_response)
        analysis_text = analysis_match.group(1).strip() if analysis_match else ""
        
        # 2. Strip ALL thinking blocks from the text to prevent nesting issues
        sanitized_response = analysis_prog.sub("", cleaned_response)

        # 3. Extract other tags from the sanitized text
        # Synced strategy: Aggregate proofs, take last final
        proof_prog = self.tag_patterns["proof"]
        proof_matches = [m.group(1).strip() for m in proof_prog.finditer(sanitized_response) if m.group(1).strip()]
        proof_text = "\n".join(proof_matches) if proof_matches else ""
        
        final_prog = self.tag_patterns["final"]
        last_final_match = None
        for m in final_prog.finditer(sanitized_response):
            last_final_match = m
        final_text = last_final_match.group(1).strip() if last_final_match else ""

        # ROBUSTNESS FALLBACK: If <answer> is missing, look for text after the last closed tag
        if not final_text:
            last_tag_match = list(self.fallback_closing_tag_pattern.finditer(sanitized_response))
            if last_tag_match:
                last_pos = last_tag_match[-1].end()
                remaining_text = sanitized_response[last_pos:].strip()
                # Only use if it's substantial (not just whitespace or random chars)
                if remaining_text and len(remaining_text) > 2:
                    final_text = remaining_text

        data = {
            "analysis": analysis_text,
            "proof": proof_text,
            "final": final_text,
            "original_response": original_response
        }
        
        return DIPGResponse(**data)
    
    def _parse_yaml(self, response: str, original_response: str = "") -> DIPGResponse:
        """Parse YAML format"""
        try:
            data = yaml.safe_load(response.strip())
            if not isinstance(data, dict):
                raise ValueError("YAML must be a dictionary")
            return DIPGResponse(original_response=original_response, **data)
        except yaml.YAMLError as e:
            raise ValueError(f"Invalid YAML format: {e}")
        except ValidationError as e:
            raise ValueError(f"YAML validation failed: {e}")
    
    def _parse_custom_tags(self, response: str, original_response: str = "") -> DIPGResponse:
        """Parse custom tag format (backward compatibility)"""
        channels = {}
        
        # Extract all channels
        for match in self.custom_tag_pattern.finditer(response):
            channel_name = match.group(1)
            content = match.group(2).strip()
            channels[channel_name] = content
        
        # Map to expected fields
        data = {
            "analysis": channels.get("analysis", ""),
            "proof": channels.get("proof", ""),
            "final": channels.get("final", ""),
            "original_response": original_response
        }
        
        try:
            return DIPGResponse(**data)
        except ValidationError as e:
            raise ValueError(f"Custom tag validation failed: {e}. Found channels: {list(channels.keys())}")
