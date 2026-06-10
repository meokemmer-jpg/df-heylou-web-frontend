import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
# [CRUX-MK]
from heylou_web_frontend import (
    OnboardingState,
    capture_hotel_data,
    health_check,
    onboarding_summary,
    setup_billing,
    validate_coupling,
    verify_email,
    verify_phone,
)


def test_sandbox_onboarding_happy_path_and_health_check():
    state = OnboardingState(sandbox=True)

    verify_email(state, "DEV-MAGIC")
    verify_phone(state, "000000")
    capture_hotel_data(state, hotel_name="Hotel HeyLou", city="Berlin", room_count=42)
    setup_billing(state, stripe_ready=False)
    validate_coupling(
        state,
        heylou_api_available=True,
        nine_os_next_available=True,
    )

    summary = onboarding_summary(state)
    assert summary["is_complete"] is True
    assert summary["next_required_step"] is None
    assert summary["hotel_name"] == "Hotel HeyLou"
    assert summary["room_count"] == 42

    health = health_check(sandbox=True)
    assert health == {"status": "ok", "degradation_mode": "full"}


def test_production_health_degradation_and_invalid_sandbox_code():
    state = OnboardingState(sandbox=True)
    verify_email(state, "DEV-MAGIC")

    try:
        verify_phone(state, "123456")
    except ValueError as exc:
        assert "invalid sandbox otp code" in str(exc)
    else:
        raise AssertionError("verify_phone should reject wrong sandbox code")

    health = health_check(
        sandbox=False,
        dependencies={"clerk": True, "stripe": False, "9os_next": False},
    )
    assert health["status"] == "ok"
    assert health["degradation_mode"] == "degraded_9os_next_stripe"
