const AssignmentsRepository = require('./assignments-repository.js');
const sinon = require('sinon');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;


describe('AssignmentsRepository Tests', () => {

    const fakeDateUtils = {
        getFirstDayOfLastMonth: () => {
            return new Date(2017, 1, 1);
        },

        getLastDayOfMonth: () => {
            return new Date(2017, 1, 31);
        }
    };

    it('should initialize repository', () => {
        const sut = new AssignmentsRepository(null, null, null, null);

        expect(sut).to.be.an.instanceof(AssignmentsRepository);
    });

    it('should pass requestObj', () => {
        const fakeAPi = {
            events: {
                list: function (request) {
                    this.req = request;
                }
            }
        };
        const fakeAuth = "fakeAuth";
        const calendarId = "calId";
        const apiSpy = sinon.spy(fakeAPi.events, "list");
        const sut = new AssignmentsRepository(fakeAPi, fakeAuth, calendarId, fakeDateUtils);
        const expectedRequestObj = {
            auth: fakeAuth,
            calendarId: calendarId,
            timeMin: fakeDateUtils.getFirstDayOfLastMonth().toISOString(),
            timeMax: fakeDateUtils.getLastDayOfMonth().toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        };

        sut.getLastMonthAssignments();
        expect(apiSpy.calledOnce).to.equal(true);
        expect(apiSpy.getCall(0).args[0]).to.deep.equal(expectedRequestObj);
    });

    it('should reject promise on error', (done) => {
        const fakeAPi = {
            events: {
                list: function (request, callback) {
                    let error = "error";
                    callback(error);
                }
            }
        };

        const sut = new AssignmentsRepository(fakeAPi, undefined, undefined, fakeDateUtils);

        expect(sut.getLastMonthAssignments()).to.be.rejected.and.notify(done);
    });

    it('should resolve promise', (done) => {
        const fakeAPi = {
            events: {
                list: function (request, callback) {
                    callback(undefined, {
                        data: {
                            items: [
                                {
                                    "id": "bik5fva30698iplb2dbvj71s2s_20160601T061500Z",
                                    "summary": "name1",
                                    "description": "some description1",
                                    "start": {
                                        "dateTime": "2017-01-01T10:00:00+02:00"
                                    },
                                    "end": {
                                        "dateTime": "2017-01-01T12:00:00+02:00"
                                    },
                                },
                                {
                                    "id": "bik5fva30698iplb2dbvj71s2s_20160601T061500Z",
                                    "summary": "name2",
                                    "description": "some description2",
                                    "start": {
                                        "dateTime": "2017-01-01T13:00:00+02:00"
                                    },
                                    "end": {
                                        "dateTime": "2017-01-01T16:00:00+02:00"
                                    },
                                }
                            ]
                        }
                    });
                }
            }
        };
        let expectedAssignments = [
            { name: 'name1', from: new Date("2017-01-01T10:00:00+02:00"), to: new Date("2017-01-01T12:00:00+02:00"), description: "some description1" },
            { name: 'name2', from: new Date("2017-01-01T13:00:00+02:00"), to: new Date("2017-01-01T16:00:00+02:00"), description: "some description2" }
        ];

        const sut = new AssignmentsRepository(fakeAPi, undefined, undefined, fakeDateUtils);

        expect(sut.getLastMonthAssignments()).eventually.deep.equal(expectedAssignments).and.notify(done);
    });
});
