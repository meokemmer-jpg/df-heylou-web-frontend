from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Optional, Set


SANDBOX_DEFAULT = True
SANDBOX_MAGIC_TOKEN = "DEV-MAGIC"
SANDBOX_OTP_CODE = "000000"

ONBOARDING_STEPS = (
    "email_verification",
    "phone_verification",
    "hotel_data_capture",
    "billing_setup",
    "coupling_check",
)


@dataclass(frozen=True)
class HotelData:
    hotel_name: str
    city: str
    room_count: int

    def __post_init__(self) -> None:
        if not self.hotel_name.strip():
            raise ValueError("hotel_name must not be empty")
        if not self.city.strip():
            raise ValueError("city must not be empty")
        if self.room_count <= 0:
            raise ValueError("room_count must be positive")


@dataclass
class OnboardingState:
    sandbox: bool = SANDBOX_DEFAULT
    completed_steps: Set[str] = field(default_factory=set)
    email_verified: bool = False
    phone_verified: bool = False
    hotel_data: Optional[HotelData] = None
    billing_ready: bool = False
    coupling_ready: bool = False

    def next_required_step(self) -> Optional[str]:
        for step in ONBOARDING_STEPS:
            if step not in self.completed_steps:
                return step
        return None

    def is_complete(self) -> bool:
        return len(self.completed_steps) == len(ONBOARDING_STEPS)


def _require_step(state: OnboardingState, expected_step: str) -> None:
    current = state.next_required_step()
    if current != expected_step:
        raise ValueError(f"expected step {current!r}, got {expected_step!r}")


def verify_email(state: OnboardingState, token: str) -> OnboardingState:
    _require_step(state, "email_verification")
    if state.sandbox:
        if token != SANDBOX_MAGIC_TOKEN:
            raise ValueError("invalid sandbox magic token")
    elif not token.strip():
        raise ValueError("token must not be empty")
    state.email_verified = True
    state.completed_steps.add("email_verification")
    return state


def verify_phone(state: OnboardingState, code: str) -> OnboardingState:
    _require_step(state, "phone_verification")
    if not state.email_verified:
        raise ValueError("email must be verified first")
    if state.sandbox:
        if code != SANDBOX_OTP_CODE:
            raise ValueError("invalid sandbox otp code")
    elif len(code.strip()) != 6 or not code.isdigit():
        raise ValueError("phone verification code must be a 6 digit string")
    state.phone_verified = True
    state.completed_steps.add("phone_verification")
    return state


def capture_hotel_data(
    state: OnboardingState,
    hotel_name: str,
    city: str,
    room_count: int,
) -> OnboardingState:
    _require_step(state, "hotel_data_capture")
    if not state.phone_verified:
        raise ValueError("phone must be verified first")
    state.hotel_data = HotelData(
        hotel_name=hotel_name,
        city=city,
        room_count=room_count,
    )
    state.completed_steps.add("hotel_data_capture")
    return state


def setup_billing(state: OnboardingState, stripe_ready: bool) -> OnboardingState:
    _require_step(state, "billing_setup")
    if state.hotel_data is None:
        raise ValueError("hotel data must be captured first")
    if not stripe_ready and not state.sandbox:
        raise ValueError("billing requires stripe in production mode")
    state.billing_ready = True
    state.completed_steps.add("billing_setup")
    return state


def validate_coupling(
    state: OnboardingState,
    heylou_api_available: bool,
    nine_os_next_available: bool,
) -> OnboardingState:
    _require_step(state, "coupling_check")
    if not state.billing_ready:
        raise ValueError("billing must be set up first")
    if not state.sandbox and not (heylou_api_available and nine_os_next_available):
        raise ValueError("all production couplings must be available")
    state.coupling_ready = heylou_api_available and nine_os_next_available
    state.completed_steps.add("coupling_check")
    return state


def onboarding_summary(state: OnboardingState) -> Dict[str, object]:
    return {
        "sandbox": state.sandbox,
        "completed_steps": tuple(sorted(state.completed_steps)),
        "next_required_step": state.next_required_step(),
        "is_complete": state.is_complete(),
        "hotel_name": None if state.hotel_data is None else state.hotel_data.hotel_name,
        "city": None if state.hotel_data is None else state.hotel_data.city,
        "room_count": None if state.hotel_data is None else state.hotel_data.room_count,
    }


def health_check(
    sandbox: bool = SANDBOX_DEFAULT,
    dependencies: Optional[Dict[str, bool]] = None,
) -> Dict[str, str]:
    dependencies = dependencies or {}

    if sandbox:
        return {"status": "ok", "degradation_mode": "full"}

    missing = sorted(name for name, ok in dependencies.items() if not ok)
    if missing:
        return {
            "status": "ok",
            "degradation_mode": "degraded_" + "_".join(missing),
        }

    return {"status": "ok", "degradation_mode": "full"}
# [CRUX-MK]
