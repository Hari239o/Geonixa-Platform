from pathlib import Path

p = Path(r'd:\PROJECTS\Exam Platform\src\app\exam\[id]\page.tsx')
text = p.read_text(encoding='utf-8')
start = text.index("const validateSlotTiming = useCallback(() => {")
end = text.index("}, [profile]);", start) + len("}, [profile]);")
new = """useEffect(() => {
    if (!profile) return;

    const validation = validateExamSlot(profile);
    setSlotValidation(validation);

    const currentUser = typeof window !== \"undefined\" ? localStorage.getItem(\"geonixa_current_user\") || \"anonymous\" : \"anonymous\";
    if (validation.status === \"EXPIRED\") {
      if (typeof window !== \"undefined\") {
        localStorage.setItem(`geonixa_passkey_expired_${currentUser}`, \"true\");
      }

      if (examState === \"ACTIVE\" && !hasSubmittedRef.current) {
        submitRef.current(\"SLOT_EXPIRED\");
        setExamState(\"VIOLATION_TERMINATED\");
      } else if (examState !== \"SUBMITTED\" && examState !== \"VIOLATION_TERMINATED\") {
        setExamState(\"VIOLATION_TERMINATED\");
      }
    }
  }, [profile, currentTime, examState]);"""
text = text[:start] + new + text[end:]
p.write_text(text, encoding='utf-8')
print('patched')
