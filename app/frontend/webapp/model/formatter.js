sap.ui.define([], function () {
    "use strict";
    return {
        formatStatus: function (sValue) {
            var mStatusMap = {
                "planning": "Information",
                "hold": "Warning",
                "inProgress": "Warning",
                "completed": "Success",
                "open": "Information",
            };

            return mStatusMap[sValue] || "None";

        },
        formatPriority: function (sValue) {
            var mPriorityMap = {
                "high": "Error",
                "medium": "Warning",
                "low": "Success"
            }

            return mPriorityMap[sValue] || "None";
        },
        formatLogType: function (sValue) {
            const sLowerValue = sValue.toLowerCase();

            const logTypeMap = {
                information: "sap-icon://information",
                error: "sap-icon://error",
                warning: "sap-icon://alert"
            }

            return logTypeMap[sLowerValue] || "sap-icon://information";

        },

        formatLogTypeButton: function (sValue) {
            console.log('kld')
            if (!sValue) {
                return sap.m.ButtonType.Neutral;
            }

            switch (sValue.toLowerCase()) {
                case "error":
                    return sap.m.ButtonType.Negative;
                case "warning":
                    return sap.m.ButtonType.Critical;
                default:
                    return sap.m.ButtonType.Neutral;
            }
            // return logTypeMap[sLowerValue] || sap.m.ButtonType.Neutral;
        },

        formatLastUpdated: function (sIsoDate) {
            if (!sIsoDate) {
                return "Last Updated: -";
            }

            const oDate = new Date(sIsoDate);
            const oNow = new Date();

            // normalize to local midnight
            oDate.setHours(0, 0, 0, 0);
            oNow.setHours(0, 0, 0, 0);

            const iDiffDays = Math.floor(
                (oNow - oDate) / (1000 * 60 * 60 * 24)
            );

            if (iDiffDays === 0) {
                return "Last Updated: Today";
            }

            if (iDiffDays === 1) {
                return "Last Updated: Yesterday";
            }

            if (iDiffDays < 7) {
                return `Last Updated: ${iDiffDays} days ago`;
            }

            return (
                "Last Updated: " +
                oDate.toLocaleDateString()
            );
        },
        hasValue: function (sValue) {
            
            if(sValue){
                return true;
            }
            return false;
        }


    };
});