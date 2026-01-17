"""
Format parser for handling various structured response formats from models.
"""
import re
import json
import yaml
from typing import Dict, Optional, Any

from .models import ParsedResponse, ResponseFormat

class FormatParser:
    """
    Parses a model's raw string response into a structured `ParsedResponse` object.
    
    It can handle different formats, like custom XML-like tags, JSON, and YAML,
    and is designed to be extensible.
    """

    def __init__(self):
        # Pre-compile regex for efficiency, supporting multiple tag names for flexibility.
        self.tag_patterns = {
            "analysis": re.compile(r"<(?:think|analysis|reasoning|thought)>(.*?)</(?:think|analysis|reasoning|thought)>", re.DOTALL | re.IGNORECASE),
            "proof": re.compile(r"<(?:proof|trace|evidence|quote)>(.*?)</(?:proof|trace|evidence|quote)>", re.DOTALL | re.IGNORECASE),
            "final": re.compile(r"<(?:answer|final|conclusion|result)>(.*?)</(?:answer|final|conclusion|result)>", re.DOTALL | re.IGNORECASE),
        }

    def parse(
        self,
        response_text: str,
        format_type: ResponseFormat = ResponseFormat.AUTO
    ) -> ParsedResponse:
        """
        Public method to parse a response.
        
        Args:
            response_text: The raw string from the model.
            format_type: The expected format.
            
        Returns:
            A ParsedResponse object.
        """
        if not response_text or not response_text.strip():
            return ParsedResponse(
                final="FORMAT_ERROR: Empty response",
                original_response=response_text,
                format_error=True
            )

        if format_type == ResponseFormat.AUTO:
            format_type = self._detect_format(response_text)

        if format_type in [ResponseFormat.CUSTOM_TAGS, ResponseFormat.XML]:
            return self._parse_custom_tags(response_text)
        elif format_type == ResponseFormat.JSON:
            return self._parse_json(response_text)
        elif format_type == ResponseFormat.YAML:
            return self._parse_yaml(response_text)
        
        # Fallback to custom tags
        return self._parse_custom_tags(response_text)

    def _detect_format(self, response: str) -> ResponseFormat:
        """Auto-detect the format of the response"""
        response_stripped = response.strip()
        
        # Check for JSON (starts with { or wrapped in markdown)
        if response_stripped.startswith('{') or '```json' in response_stripped.lower() or (response_stripped.startswith('```') and '{' in response_stripped):
            return ResponseFormat.JSON
        
        # Check for XML/Custom Tags (contains closing tags)
        if '</' in response_stripped and '>' in response_stripped:
             return ResponseFormat.CUSTOM_TAGS
        
        # Check for YAML (has key: value structure for required fields)
        if all(field in response_stripped for field in ['analysis:', 'proof:', 'final:']) or '```yaml' in response_stripped.lower():
            return ResponseFormat.YAML
        
        # Default to custom tags
        return ResponseFormat.CUSTOM_TAGS

    def _parse_custom_tags(self, response_text: str) -> ParsedResponse:
        """
        Parses a response expected to contain custom XML-like tags.
        """
        extracted: Dict[str, Optional[str]] = {}
        for key, pattern in self.tag_patterns.items():
            match = pattern.search(response_text)
            if match:
                extracted[key] = match.group(1).strip()
            else:
                extracted[key] = None

        # The 'final' answer is mandatory. If it's missing, it's a format error.
        if extracted.get("final") is None:
            return ParsedResponse(
                analysis=extracted.get("analysis"),
                proof=extracted.get("proof"),
                final=f"FORMAT_ERROR: Missing <answer> tag. Original response: {response_text}",
                original_response=response_text,
                format_error=True,
            )

        return ParsedResponse(
            analysis=extracted.get("analysis"),
            proof=extracted.get("proof"),
            final=extracted["final"],
            original_response=response_text,
            format_error=False,
        )

    def _parse_json(self, response_text: str) -> ParsedResponse:
        """Parses a JSON response with robustness improvements."""
        cleaned_response = response_text.strip()
        
        # Strip markdown code blocks
        if '```' in cleaned_response:
            first_backtick = cleaned_response.find('```')
            last_backtick = cleaned_response.rfind('```')
            if first_backtick != -1 and last_backtick != -1 and first_backtick < last_backtick:
                content_block = cleaned_response[first_backtick + 3 : last_backtick]
                cleaned_response = re.sub(r'^\w*\s*', '', content_block).strip()
            
        try:
            data = json.loads(cleaned_response)
            
            # Normalize field aliases
            aliases = {
                'analysis': ['reasoning', 'thought', 'thoughts', 'explanation', 'analysis', 'think'],
                'proof': ['evidence', 'quote', 'reference', 'source', 'proof', 'trace'],
                'final': ['answer', 'conclusion', 'result', 'final_answer', 'final']
            }
            
            normalized = {}
            for target, sources in aliases.items():
                for s in sources:
                    if s in data:
                        normalized[target] = data[s]
                        break
            
            if not normalized.get('final'):
                return ParsedResponse(
                    analysis=normalized.get('analysis'),
                    proof=normalized.get('proof'),
                    final=f"FORMAT_ERROR: Missing final answer in JSON. Original: {response_text}",
                    original_response=response_text,
                    format_error=True
                )

            return ParsedResponse(
                analysis=normalized.get('analysis'),
                proof=normalized.get('proof'),
                final=str(normalized['final']),
                original_response=response_text,
                format_error=False
            )
        except Exception as e:
            return ParsedResponse(
                final=f"FORMAT_ERROR: JSON parse failed: {str(e)}",
                original_response=response_text,
                format_error=True
            )

    def _parse_yaml(self, response_text: str) -> ParsedResponse:
        """Parses a YAML response."""
        try:
            data = yaml.safe_load(response_text.strip())
            if not isinstance(data, dict):
                raise ValueError("YAML must be a dictionary")
            
            # Same alias logic as JSON
            aliases = {
                'analysis': ['reasoning', 'thought', 'thoughts', 'explanation', 'analysis', 'think'],
                'proof': ['evidence', 'quote', 'reference', 'source', 'proof', 'trace'],
                'final': ['answer', 'conclusion', 'result', 'final_answer', 'final']
            }
            
            normalized = {}
            for target, sources in aliases.items():
                for s in sources:
                    if s in data:
                        normalized[target] = data[s]
                        break

            if not normalized.get('final'):
                return ParsedResponse(
                    analysis=normalized.get('analysis'),
                    proof=normalized.get('proof'),
                    final=f"FORMAT_ERROR: Missing final answer in YAML. Original: {response_text}",
                    original_response=response_text,
                    format_error=True
                )

            return ParsedResponse(
                analysis=normalized.get('analysis'),
                proof=normalized.get('proof'),
                final=str(normalized['final']),
                original_response=response_text,
                format_error=False
            )
        except Exception as e:
            return ParsedResponse(
                final=f"FORMAT_ERROR: YAML parse failed: {str(e)}",
                original_response=response_text,
                format_error=True
            )