"""
Format parser for handling various structured response formats from models.
"""
import re
from typing import Dict, Optional

from .models import ParsedResponse, ResponseFormat

class FormatParser:
    """
    Parses a model's raw string response into a structured `ParsedResponse` object.
    
    It can handle different formats, like custom XML-like tags, and is designed
    to be extensible for future formats (e.g., JSON).
    """

    def __init__(self):
        # Pre-compile regex for efficiency, supporting multiple tag names for flexibility.
        self.tag_patterns = {
            "analysis": re.compile(r"<(?:think|analysis)>(.*?)</(?:think|analysis)>", re.DOTALL),
            "proof": re.compile(r"<(?:proof|trace)>(.*?)</(?:proof|trace)>", re.DOTALL),
            "final": re.compile(r"<(?:answer|final)>(.*?)</(?:answer|final)>", re.DOTALL),
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
            format_type: The expected format. Currently only supports CUSTOM_TAGS or AUTO.
            
        Returns:
            A ParsedResponse object.
            
        Raises:
            ValueError: If the format is unsupported or if required fields are missing.
        """
        if format_type not in [ResponseFormat.AUTO, ResponseFormat.CUSTOM_TAGS, ResponseFormat.XML]:
            raise ValueError(f"Unsupported format type: {format_type}")

        return self._parse_custom_tags(response_text)

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
