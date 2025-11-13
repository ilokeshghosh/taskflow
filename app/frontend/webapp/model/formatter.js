sap.ui.define([], function () {
    "use strict";
    return {
        formatStatus: function (sValue) {
            // Capitalize first letter
            // Map status to ObjectStatus state
            var mStatusMap = {
                "planning": "Information",
                "hold": "Warning",
                "inProgress": "Warning",
                "completed": "Success",
                "open": "Information"
            };

            return mStatusMap[sValue] || "None";

        },
    };
});