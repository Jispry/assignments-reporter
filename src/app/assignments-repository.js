function mapEventToAssignment(event) {
    return {
        name: event.summary,
        from: new Date(event.start.dateTime),
        to: new Date(event.end.dateTime),
        description: event.description
    };
}

module.exports = class AssignmentsRepository {
    /**
     * 
     * @param {any} calendarApi 
     * @param {any} auth 
     * @param {String} calendarId 
     * @param {DateUtils} dateUtils 
     */
    constructor(calendarApi, auth, calendarId, dateUtils) {
        this._api = calendarApi;
        this._auth = auth;
        this._calendarId = calendarId;
        this._dateUtils = dateUtils;
    }

    /**
     * @return {Promise}
     */
    getLastMonthAssignments() {
        /**
         * @type {String}
         */
        const fromISO = this._dateUtils.getFirstDayOfLastMonth().toISOString();
        /**
         * @type {String}
         */
        const toISO = this._dateUtils.getLastDayOfMonth().toISOString(); 
        return this.getAssignementsForPeriod(fromISO, toISO);
    }

    /**
     * 
     * @param {String} from date ISOString
     * @param {String} to date ISOString
     * @return {Promise}
     */
    getAssignementsForPeriod(from, to){
        console.log(from);
        console.log(to);
        const request = {
            auth: this._auth,
            calendarId: this._calendarId,
            timeMin: from,
            timeMax: to,
            singleEvents: true,
            orderBy: 'startTime'
        };
        var promise = new Promise((resolve, reject) => {
            this._api.events.list(request, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    var events = response.items.map(mapEventToAssignment);
                    resolve(events);
                }
            });
        });
        return promise;
    }
};
