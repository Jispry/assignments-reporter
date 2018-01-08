module.exports = class TestDateUtils {
    static getFirstDayOfLastMonth() {
        console.warn('using Test DateUtils Class');
        const thisDate = new Date();

        return new Date(thisDate.getFullYear(), thisDate.getMonth(), 1, 0, 0, 0);
    }

    static getLastDayOfMonth() {
        console.warn('using Test DateUtils Class');
        const thisDate = new Date();
        const lastDay = new Date(thisDate.getFullYear(), thisDate.getMonth() + 1, 1, 0, 0, 0);
        lastDay.setDate(lastDay.getDate() - 1);
        return new Date(thisDate.getFullYear(), thisDate.getMonth(), lastDay.getDate(), 0, 0, 0);
    }
};
