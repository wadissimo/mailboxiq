/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */

//const fetch = require('node-fetch');






Office.onReady(function () {
	document.getElementById("config_table").style.display = "none";
	document.getElementById("main_table").style.display = "flex"; 
	document.getElementById("refresh_button").onclick = on_click_refresh_button;
	document.getElementById("genereate_summary").onclick = on_click_genereate_summary;
	document.getElementById("rephrase").onclick = on_click_rephrase;
	document.getElementById("prompt_button").onclick = on_click_prompt_button;
	document.getElementById("en_de_translation").onclick = on_click_translate;
	document.getElementById("severity_classification").onclick = on_click_severity_classification;
	document.getElementById("fraud_classification").onclick = on_click_fraud_classification;
	fraud_classification

	//append_debug("Loaded")
	//prependItemBody("test prepend")

});

// Requests

function on_click_refresh_button() {
	// update sentiment and tone
	show_load_spinner();
	request_service(get_tone_and_sentiment_service(), update_tone_and_sentiment);
}

function on_click_genereate_summary() {
	show_load_spinner();
	request_service(get_generate_summary_service(), insert_response_text_into_body);
}

function on_click_rephrase() {
	show_load_spinner();
	request_service(get_rephrase_service(), insert_response_text_into_body);
}

function on_click_prompt_button() {
	show_load_spinner();
	var prompt = document.getElementById("prompt_input").value;
	if (prompt && prompt.length > 0) {
		request_service(get_prompt_service(), insert_response_text_into_body, prompt);
	}
}

function on_click_translate() {
	show_load_spinner();
	request_service(get_translate_service(), insert_response_text_into_body);
}

function on_click_severity_classification() {
	show_load_spinner();
	request_service(get_classify_severity_service(), insert_response_text_into_body);
}

function on_click_fraud_classification() {
	show_load_spinner();
	request_service(get_classify_fraud_service(), insert_response_text_into_body);
}






// Response
function update_tone_and_sentiment(result){
	hide_load_spinner()
	if(result["error"]){
		show_no_info();
		append_debug("ERROR: "+JSON.stringify(result));
	} else {
		var sentiment = result["sentiment"];
		var tone = result["tone"];
		//append_debug("DEBUG:"+ sentiment+ " " + tone);
		if (tone == "toxic"){
			show_inpolite();
		} else {
			show_polite();
		}
		if (sentiment == "negative") {
			show_negative();
		} else {
			show_positive();
		}
		//append_debug("DEBUG: "+JSON.stringify(result));

	}
}

function insert_response_text_into_body(result) {
	hide_load_spinner()
	if(result["error"]){
		append_debug("ERROR: "+JSON.stringify(result));
	} else {
		var text = result["text"];
		prependItemBody(text)
		//append_debug("DEBUG: "+JSON.stringify(result));
	}
}


// UI functions


function show_polite(){
	document.getElementById("tone_no_info").style.display="none";
	document.getElementById("tone_thumbs_up").style.display="inline";
	document.getElementById("tone_thumbs_down").style.display="none";
}
function show_inpolite(){
	document.getElementById("tone_no_info").style.display="none";
	document.getElementById("tone_thumbs_down").style.display="inline";
	document.getElementById("tone_thumbs_up").style.display="none";	
}

function show_positive(){
	document.getElementById("sentiment_no_info").style.display="none";
	document.getElementById("sentiment_positive").style.display="inline";
	document.getElementById("sentiment_negative").style.display="none";
}

function show_negative(){
	document.getElementById("sentiment_no_info").style.display="none";
	document.getElementById("sentiment_negative").style.display="inline";
	document.getElementById("sentiment_positive").style.display="none";
}

function show_no_info(){
	document.getElementById("sentiment_no_info").style.display="inline";
	document.getElementById("sentiment_negative").style.display="none";
	document.getElementById("sentiment_positive").style.display="none";
}

function show_load_spinner(){
	document.getElementById("load_spinner").style.display="flex";
}
function hide_load_spinner(){
	document.getElementById("load_spinner").style.display="none";
}


// Remote functions

function get_tone_and_sentiment_service() {
	return '/classify_tone_and_sentiment'
}

function get_generate_summary_service() {
	return '/generate_summary'
}

function get_rephrase_service() {
	return '/rephrase'
}

function get_prompt_service() {
	return '/prompt'
}

function get_translate_service() {
	return '/translate'
}

function get_classify_severity_service() {
	return '/classify_severity'
}


function get_classify_fraud_service() {
	return '/classify_fraud'
}


function request_service(service, callback, params){
	request_body_data(function(body){
		SendRequest(service, body, callback, params);
	});
}


function request_body_data(callback){
	Office.context.mailbox.item.getSelectedDataAsync("text", function (result) {
		if (result.value.data) {
			callback(result.value.data);
		} else {
			Office.context.mailbox.item.body.getAsync("text", function(result){
				if (result.value) {
					callback(result.value);
				}
			});
		}
	});
	 
}


function SendRequest(service, body, callback_func, params) {
	var payload = {
		"body": body
	};
	if (typeof params !== 'undefined') {
		payload = {
			"body": body,
			"params":params
		};
	}

	fetch(service, {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(res => res.json())
		.then(json => callback_func(json))
		.catch (err => callback_func(err))
		
}






function prependItemBody(text) {
    Office.context.mailbox.item.body.getTypeAsync(
        function (result) {
            if (result.status == Office.AsyncResultStatus.Failed){
                append_debug(asyncResult.error.message);
            }
            else {
                // Successfully got the type of item body.
                // Prepend data of the appropriate type in body.
                if (result.value == Office.MailboxEnums.BodyType.Html) {
                    // Body is of HTML type.
                    // Specify HTML in the coercionType parameter
                    // of prependAsync.
                    Office.context.mailbox.item.body.prependAsync(
                        '<p><b>'+text+'</b></p><p><br/></p>',
                        { coercionType: Office.CoercionType.Html},
                        function (asyncResult) {
                            if (asyncResult.status == 
                                Office.AsyncResultStatus.Failed){
                                append_debug(asyncResult.error.message);
                            }
                            else {
                                // Successfully prepended data in item body.
                            }
                        });
                }
                else {
                    // Body is of text type. 
                    Office.context.mailbox.item.body.prependAsync(
                        text+"\n\n",
                        { coercionType: Office.CoercionType.Text},
                        function (asyncResult) {
                            if (asyncResult.status == 
                                Office.AsyncResultStatus.Failed){
                                append_debug(asyncResult.error.message);
                            }
                            else {
                                // Successfully prepended data in item body.
                            }
                         });
                }
            }
        });
}

function append_debug(message){
	document.getElementById("debug").innerHTML += escapeHtml(message) + "</br>";
}

function escapeHtml(unsafe)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
		 .replace(/\n/g, "<br/>");
 }




