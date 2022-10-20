sap.ui.define([
	"sap/ui/model/json/JSONModel",
], function (JSONModel) {
	"use strict";
	
	// Firebase-config retrieved from the Firebase-console
    const firebaseConfig = {
        apiKey: "AIzaSyBP1COt7AvhbL-lD9VAUymh0X7ch2RxhjQ",
        authDomain: "flying-money-615ca.firebaseapp.com",
        projectId: "flying-money-615ca",
        storageBucket: "flying-money-615ca.appspot.com",
        messagingSenderId: "1053682881386",
        appId: "1:1053682881386:web:203ea0d811b0300247cb13"
    }

	return {
		initializeFirebase: function () {
			firebase.initializeApp(firebaseConfig);
			const oModel = new JSONModel(firebase);
			return oModel;
		}
	};
});