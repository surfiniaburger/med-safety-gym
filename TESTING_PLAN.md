# Testing Plan: Standalone Evaluation Package

## Branch Information
- **Branch**: `feature/standalone-evaluation-package`
- **Base**: `purple`
- **PR**: https://github.com/surfiniaburger/med-safety-gym/pull/new/feature/standalone-evaluation-package

## What Changed

### New Files
1. **`med_safety_eval/`** - Standalone evaluation package
   - `__init__.py` - Public API exports
   - `logic.py` - Pure reward calculation functions
   - `manager.py` - LocalEvaluationManager class
   - `models.py` - Pydantic models
   - `format_parser.py` - Response format parser

2. **`med_safety_gym/evaluation_service_v2.py`** - New evaluation service using standalone library

3. **Example Scripts**
   - `scripts/run_standalone_eval.py` - Standalone demo
   - `examples/colab_standalone_eval.py` - Colab example
   - `scripts/test_green_agent_compatibility.py` - API test

### Modified Files
1. **`med_safety_gym/green_agent.py`** - Now imports from `evaluation_service_v2`
2. **`pyproject.toml`** - Added `med_safety_eval` to packages list

## Testing Steps

### 1. Local Testing (Already Done ✓)
- [x] Standalone evaluation works
- [x] Package imports successfully
- [x] API compatibility verified

### 2. Green Agent Testing (To Do)

Test the green agent with the new evaluation service:

```bash
# Option A: Run green agent tests if you have them
uv run pytest tests/ -k green_agent

# Option B: Deploy and test manually
# 1. Deploy the green agent to your test environment
# 2. Trigger an evaluation via AgentBeats
# 3. Verify results are correct
```

**What to verify**:
- Green agent starts successfully
- Evaluation completes without errors
- Results have all expected metrics
- Mean reward calculations are correct
- Detailed results are properly formatted

### 3. Integration Testing (To Do)

If you have integration tests:

```bash
# Run full test suite
uv run pytest tests/

# Run specific integration tests
uv run pytest tests/integration/
```

### 4. Smoke Testing (To Do)

Quick sanity checks:

```bash
# Test standalone evaluation
uv run python scripts/run_standalone_eval.py

# Test API compatibility
uv run python scripts/test_green_agent_compatibility.py

# Test imports
uv run python -c "from med_safety_eval import LocalEvaluationManager; print('✓ Import successful')"
uv run python -c "from med_safety_gym.evaluation_service_v2 import EvaluationManager; print('✓ Import successful')"
```

## Success Criteria

Before merging, verify:

- [ ] Green agent runs successfully with evaluation_service_v2
- [ ] All evaluation metrics match expected values
- [ ] No errors in logs
- [ ] Results can be serialized with `model_dump()`
- [ ] Standalone evaluation works without server
- [ ] All existing tests pass (if any)

## Rollback Plan

If issues are found:

```bash
# Switch back to purple branch
git checkout purple

# Or revert the green_agent.py change
git checkout purple -- med_safety_gym/green_agent.py
```

The original `evaluation_service.py` is untouched, so reverting is safe.

## Next Steps After Testing

Once green agent testing passes:

1. **Write Unit Tests** (Phase 4)
   - Tests for `med_safety_eval/logic.py` functions
   - Tests for `LocalEvaluationManager`
   - Tests for format parser

2. **Update Documentation**
   - Add standalone evaluation examples to README
   - Document migration from V1 to V2

3. **Create GitHub Workflow**
   - CI for standalone evaluation tests
   - Automated testing on PRs

4. **Final Migration**
   - Delete `evaluation_service.py`
   - Rename `evaluation_service_v2.py` → `evaluation_service.py`
   - Update all imports back to original
   - Merge to main branch

## Questions?

If you encounter issues:
1. Check logs for error messages
2. Verify reward config matches original
3. Compare results with original evaluation_service
4. Test with mock data first before real green agent deployment
