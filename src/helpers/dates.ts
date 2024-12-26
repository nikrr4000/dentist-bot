import moment from "moment-timezone";

export default {
	currDate: () => new Date(),
	dateFromString: (dateStr: string) => new Date(dateStr),
	parseApptDate: (date: Date | string) => {
		return moment(date)
			.locale("ru")
			.format("LLL")
			.replace(/ 202. г\./, "");
	},
	apptDateFromString: (dateStr: string) => {
		const format = "DD.MM.YY, HH:mm";
		const date = moment(dateStr, format);

		return date.toDate();
	},
	isDatePassed(dateToCheck: Date) {
		const currDate = this.currDate();
		return currDate > dateToCheck;
	},
	dateIsTomorrow: function isTomorrow(dateStr: string) {
		const inputDate = moment.utc(dateStr);
		const tomorrow = moment().utc().add(1, "days").startOf("day");

		return inputDate.isSame(tomorrow, "day");
	},
	getStrDateWithoutTime: (date: string) => date.split(",")[0],
	getStrDateWithoutDate: (date: string) => date.split(",")[1],
};
