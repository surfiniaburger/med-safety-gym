

import pytest
from med_safety_eval import FormatParser, ResponseFormat, ParsedResponse

def test_format_detection_json():
    parser = FormatParser()
    json_response = '{"analysis": "thinking", "proof": "quote", "final": "answer"}'
    detected = parser._detect_format(json_response)
    assert detected == ResponseFormat.JSON

def test_format_detection_xml():
    parser = FormatParser()
    xml_response = "<think>thinking</think><proof>quote</proof><answer>answer</answer>"
    detected = parser._detect_format(xml_response)
    assert detected == ResponseFormat.CUSTOM_TAGS

def test_format_detection_yaml():
    parser = FormatParser()
    yaml_response = "analysis: thinking\nproof: quote\nfinal: answer"
    detected = parser._detect_format(yaml_response)
    assert detected == ResponseFormat.YAML

def test_parse_json_with_aliases():
    parser = FormatParser()
    json_response = '{"reasoning": "thinking", "evidence": "quote", "conclusion": "answer"}'
    parsed = parser.parse(json_response, ResponseFormat.JSON)
    assert parsed.analysis == "thinking"
    assert parsed.proof == "quote"
    assert parsed.final == "answer"
    assert not parsed.format_error

def test_parse_xml_case_insensitive():
    parser = FormatParser()
    xml_response = "<THINK>thinking</THINK><PROOF>quote</PROOF><ANSWER>answer</ANSWER>"
    parsed = parser.parse(xml_response, ResponseFormat.CUSTOM_TAGS)
    assert parsed.analysis == "thinking"
    assert parsed.proof == "quote"
    assert parsed.final == "answer"
    assert not parsed.format_error

def test_parse_auto_json():
    parser = FormatParser()
    json_response = '{"analysis": "thinking", "proof": "quote", "final": "answer"}'
    parsed = parser.parse(json_response, ResponseFormat.AUTO)
    assert parsed.final == "answer"
    assert not parsed.format_error

def test_parse_auto_xml():
    parser = FormatParser()
    xml_response = "<think>thinking</think><proof>quote</proof><answer>answer</answer>"
    parsed = parser.parse(xml_response, ResponseFormat.AUTO)
    assert parsed.final == "answer"
    assert not parsed.format_error

def test_parse_error_missing_final():
    parser = FormatParser()
    xml_response = "<think>thinking</think><proof>quote</proof>"
    parsed = parser.parse(xml_response, ResponseFormat.CUSTOM_TAGS)
    assert parsed.format_error
    assert "FORMAT_ERROR" in parsed.final

