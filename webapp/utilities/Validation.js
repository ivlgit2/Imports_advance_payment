/*Check if the value is empty*/
function Check_empty(Value) {
	if (Value.trim().length == 0) {
		return false;
	}
	return true;
}
/* Check the length of the string*/
function Check_length(Value) {
	return Value.length;
}

jQuery.sap.declare("Container.Formatter");

Container.Formatter = {
	formatDate: function (value) { // value is the date 
		if (typeof value === 'undefined' || value === null || value == "00000000" || value == "") {
			return "";
		} else if (value instanceof Date) {
			var NewDateform = value;
			var mnth = ("0" + (NewDateform.getMonth() + 1)).slice(-2);
			var day = ("0" + NewDateform.getDate()).slice(-2);
			var output = [day, mnth, NewDateform.getFullYear()].join("/");
			return output;
		} else {
			var year = value.substring(0, 4);
			var month = value.substring(4, 6);
			var day = value.substring(6, 8);
			return day + "/" + month + "/" + year; // return the formatted date
		}
	},
	formatLicenseDate: function (value) {
		if (value) {
			var year = value.substring(0, 4);
			var month = value.substring(5, 7);
			var day = value.substring(8, 10);
			return day + "/" + month + "/" + year; // return the formatted date
		}
	},
	formatAmount: function (value) { // value is the date 
		if (typeof value === 'undefined' || value === null || value === "") {} else {
			//alert(parseInt(value.trim()));
			return parseFloat(value.trim());
		}
	},
	formatCheckedString: function (value) {
		if (value === "X") {
			return "Yes";
		} else {
			return "No";
		}
	},
	formatToSapDate: function (value) { // value is the date  
		if (typeof value === 'undefined' || value === null || value == "00000000" || value == "") {
			return "";
		} else {
			var splitval = value.split("/");
		}
		var year = splitval[2];
		var month = splitval[1];
		var day = splitval[0];
		return year + month + day; // return the formatted date
	},
	TrimValue: function (value) { // value is the date 
		if (typeof value === 'undefined' || value === null || value === "") {} else {
			//alert(parseInt(value.trim()));
			return (value.trim());
		}
	},
	buttonText: function (v) {
		return v ? 'Show More Details' : 'Hide More Details';
	},
	buttonIcon: function (src) {
		return src ? 'sap-icon://open-command-field' : 'sap-icon://close-command-field';
	},
	formatCheckBox: function (value) {
		if (value === "X") {
			return true;
		} else {
			return false;
		}
	},
	ConvertJsonDate: function (value) {
		output = "";
		if (value) {
			if (value instanceof Date) {
				var NewDateform = value;
			} else if (value.indexOf("T00:00:00")) {
				var NewDateform = new Date(value.substring(0, 10));
			} else {
				var formattedJsonDate = eval('new' + value.replace(/\//g, ' '));
				var NewDateform = new Date(formattedJsonDate);
			}
			var mnth = ("0" + (NewDateform.getMonth() + 1)).slice(-2);
			var day = ("0" + NewDateform.getDate()).slice(-2);
			var output = [day, mnth, NewDateform.getFullYear()].join("/");
		}
		return output;

	},

	formatBenefitClass: function (value) {
		if (value === "MES") {
			return "MEIS";
		} else if (value === "DFL") {
			return "DUTY FREE SCHEMES";
		} else if (value === "EPCG") {
			return "EXPORT PROMOTION CAPITAL GOOD";
		}
	},
	ConvertDate: function (value) {

        var output = "";

        if (value) {

            if (value instanceof Date) {

                var NewDateform = value;

            }

            var mnth = ("0" + (NewDateform.getMonth() + 1)).slice(-2);

            var day = ("0" + NewDateform.getDate()).slice(-2);

            output = [day, mnth, NewDateform.getFullYear()].join("/");

        }

        return output;

    },
	formatDateandTime: function (value) { // value is the date 
		var year, month, day;
		if (typeof value === 'undefined' || value === null || value == "00000000" || value == "") {
			return "";
		} else {

			if (value instanceof Date) {
				month = ("0" + (value.getMonth() + 1)).slice(-2);
				day = ("0" + value.getDate()).slice(-2);
				year = value.getFullYear();
			} else {
				year = value.substring(0, 4);
				month = value.substring(5, 7);
				day = value.substring(8, 10);
			}
			return day + "/" + month + "/" + year; // return the formatted date
		}
	},
	convertToSAPdate: function (value) {
		//alert(value);
		if (value) {
			if (value instanceof Date) {
				var NewDateform = value;
			} else if (value.indexOf("T00:00:00")) {
				return value;
			} else {
				////        var year = value.substring(0, 4);
				//            var month = value.substring(4, 6);
				//            var day = value.substring(0, 2);
			}
			var mnth = ("0" + (NewDateform.getMonth() + 1)).slice(-2);
			var day = ("0" + NewDateform.getDate()).slice(-2);
			var output = [NewDateform.getFullYear(), mnth, day].join("-") + "T00:00:00";
			return output;
		}
	},
	/*formatToSapDateTime : function (value) {// value is the date  
	                if (typeof value === 'undefined' || value === null||value=="00000000"||value=="") {                       
	                                return "";
	                } else {
	                                if(value.length==10){
	                                                var splitval=value.split("/");                                         
	                                                var year =splitval[2];
	                                                var month =splitval[1];
	                                                var day =splitval[0];
	                                                return year+"-"+month+"-"+day+"T00:00:00"; // return the formatted date
	                                } else if(value.length<=2){
	                                                                return value;
	                                                
	                                } else if(value.length<=5){
	                                                var splitval=value.split("/");         
	                                                var month =splitval[1];
	                                                var day =splitval[0];
	                                                return month+"-"+day+"T00:00:00";
	                                }
	                }
	},*/
	/*	SetVisible:function(itemno,dutyarray){
			return true;
			var filterduty=dutyarray.filter(a=>a.boeitno==itemno);
			var rdfilter=filterduty.filter(a=>a.rand_no!="");
			if(rdfilter){
				return true;
			}else{
				return false;
			}
		}*/
};