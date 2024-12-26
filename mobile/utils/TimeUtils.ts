export function adjustTime(timeString: string) {
	const [hours, minutes] = timeString.split(':').map(Number);

	let adjustedHours = hours + 3;

	if (adjustedHours >= 24) {
		adjustedHours -= 24;
	}
	const adjustedTimeString = `${String(adjustedHours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}`;

	return adjustedTimeString;
}
