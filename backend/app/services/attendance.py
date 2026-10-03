from math import floor, ceil


def percentage(attended: int, total: int) -> float:
    if total <= 0:
        return 100.0
    return round((attended / total) * 100, 2)


def max_bunks(attended: int, total: int, target: float) -> int:
    t = target / 100
    if t <= 0:
        return 999
    if total == 0:
        return 0
    # attended / (total + b) >= t  => b <= attended/t - total
    allowed = floor(attended / t - total)
    return max(0, allowed)


def classes_needed(attended: int, total: int, target: float) -> int:
    t = target / 100
    if t >= 1:
        return 0 if attended >= total and percentage(attended, total) >= 100 else 999
    if percentage(attended, total) >= target:
        return 0
    # (attended + x) / (total + x) >= t
    needed = ceil((t * total - attended) / (1 - t))
    return max(0, needed)


def after_bunks(attended: int, total: int, bunks: int) -> float:
    return percentage(attended, total + bunks)


def after_attend(attended: int, total: int, extra: int) -> float:
    return percentage(attended + extra, total + extra)


def status_label(pct: float, target: float) -> str:
    if pct >= target:
        return "safe"
    if pct >= target - 5:
        return "warning"
    return "risk"
