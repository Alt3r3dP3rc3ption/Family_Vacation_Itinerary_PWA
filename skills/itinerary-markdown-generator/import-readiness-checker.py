from pathlib import Path
from validator import validate_file


def score(result):
    score_value = 100
    score_value -= len(result.errors) * 25
    score_value -= len(result.warnings) * 5
    return max(score_value, 0)


if __name__ == '__main__':
    import sys

    if len(sys.argv) != 2:
        print('Usage: import-readiness-checker.py itinerary.md')
        raise SystemExit(2)

    result = validate_file(Path(sys.argv[1]))
    readiness = score(result)

    print(f'Readiness Score: {readiness}/100')
    print(result.format_report())

    if readiness >= 90:
        print('Recommendation: Ready for import.')
    elif readiness >= 70:
        print('Recommendation: Importable but review warnings.')
    else:
        print('Recommendation: Fix issues before import.')
