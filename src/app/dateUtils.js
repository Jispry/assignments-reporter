module.exports = class DateUtils {
    static getFirstDayOfLastMonth() {
        const thisDate = new Date();

        return new Date(thisDate.getFullYear(), thisDate.getMonth() - 1, 1);
    }

    static getLastDayOfMonth() {
        const thisDate = new Date();
        const lastDay = new Date(thisDate.getFullYear(), thisDate.getMonth(), 1, 0, 0, 0);
        lastDay.setDate(lastDay.getDate());
        return lastDay;
    }
};
