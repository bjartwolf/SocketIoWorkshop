var MYAPP = MYAPP || {};
(function () {
    "use strict";
    var serverURL = "http://" + location.host;
    MYAPP.services = MYAPP.services || {};

    MYAPP.services.load = function (callback) {
        $.getJSON(serverURL + "/reservations", {
        }).success(function (result) {//Result is an array of Seat Reservations
            callback(null, result);
        }).error(function () {
            callback("some error occurred");
        });
    };

    MYAPP.services.saveItem = function (data, callback) {
        $.ajax(serverURL + "/reservations", {
            data: ko.toJS(data),
            dataType: 'json',
            type: 'post'
        }).success(function (result) {
            if (!data.id()) {
                data.id(result.id);
            }
            callback(null, result);
        }).error(function () {
            callback("some error occured");
        });
    };

    MYAPP.services.removeItem = function (data, callback) {
        $.ajax(serverURL + "/reservations", {
            data: ko.toJS(data),
            dataType: 'json',
            type: "delete"
        }).success(function (result) {
            callback(null, result);
        }).error(function (x, msg, err) {
            callback("some error occured" + msg);
        });
    };
}());
