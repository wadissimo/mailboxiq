/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */

const fetch = require('node-fetch');


const translate_service = 'https://translation.googleapis.com/language/translate/v2'



var project_id = "";
var location = "";
var token = "";

function get_palm_service() {
	return 'https://us-central1-aiplatform.googleapis.com/v1/projects/' + project_id + '/locations/'+location+'/publishers/google/models/text-bison:predict'
}

function SendRequest(service, datatosend, callback_func) {
    
	fetch(service, {
		method: 'POST',
		body: JSON.stringify(datatosend),
		headers: {
				'Content-Type': 'application/json', //Specifying to the server that we are sending JSON 
				'Authorization': 'Bearer ' + token
			}
	})
		.then(res => res.json())
		.then(json => callback_func(json))
		.catch (err => callback_func(err))   
}







Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = refresh_request;
	document.getElementById("genereate_summary").onclick = genereate_summary_request;
	document.getElementById("rephrase").onclick = genereate_rephrase_request;
	document.getElementById("en_de_translation").onclick = translate_request;
	document.getElementById("prompt_button").onclick = prompt_input_request;
	document.getElementById("save_config_button").onclick = save_config_button;
	document.getElementById("open_config").onclick = show_config_form_init;
	
	if (project_id == "") {
		show_config_form();
	} else {
		show_main_table();
	}

  }
});

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

export async function refresh_request() {
	// update sentiment and tone
	request_body_data(process_text)
}

export async function genereate_summary_request() {
	// generate summary
	request_body_data(summarize_text)
}

export async function genereate_rephrase_request() {
	// generate summary
	request_body_data(rephrase_text)
  
}

export async function translate_request() {
	// generate summary
	request_body_data(translate_text)
  
}

export async function prompt_input_request() {
	// generate summary
	request_body_data(prompt_generate_text) 
}

function save_config_button() {
	project_id = document.getElementById("project_id_config_input").value;
	location = document.getElementById("location_config_input").value;
	token = document.getElementById("token_config_input").value;
	show_main_table();
}

function process_text(text) {
	
	var sentiment_payload = {
	  "instances": [
		{ "prompt": "input: "+escapeHtml(text)+".   Classify the sentiment of the reply message:"}
	  ],
	  "parameters": {
		"temperature": 0.2,
		"maxOutputTokens": 256,
		"topK": 40,
		"topP": 0.95
	  }
	};
	
	var tone_payload = {
	  "instances": [
		{ "prompt": "input: "+escapeHtml(text)+".   Classify politeness of the language tone of the reply message: toxic, polite, or normal"}
	  ],
	  "parameters": {
		"temperature": 0.2,
		"maxOutputTokens": 256,
		"topK": 40,
		"topP": 0.95
	  }
	};
	reset_debug()
	append_debug("Sending....");
	SendRequest(get_palm_service(), sentiment_payload, update_sentiment);
	SendRequest(get_palm_service(), tone_payload, update_tone);
}

function summarize_text(text) {
	
	var summarize_payload = {
	  "instances": [
		{ "prompt": "input: "+escapeHtml(text)+".   Summarize the text:"}
	  ],
	  "parameters": {
		"temperature": 0.2,
		"maxOutputTokens": 256,
		"topK": 40,
		"topP": 0.95
	  }
	};
	reset_debug()
	append_debug("Sending....");
	SendRequest(get_palm_service(), summarize_payload, update_summary);
}

function update_summary(result){
	if(result["predictions"] ) {
		var summary = result["predictions"][0]["content"]
		prependItemBody("Summary:" + escapeHtml(summary));
		append_debug("DEBUG:"+escapeHtml(summary));
		append_debug("DEBUG:"+JSON.stringify(result));
	} else {
		append_debug("DEBUG:"+JSON.stringify(result));
	}
}

function rephrase_text(text) {
	
	var payload = {
	  "instances": [
		{ "prompt": "input: "+escapeHtml(text)+".   Rephrase the response in polite and positive manner:"}
	  ],
	  "parameters": {
		"temperature": 0.2,
		"maxOutputTokens": 256,
		"topK": 40,
		"topP": 0.95
	  }
	};
	reset_debug()
	append_debug("Sending....");
	SendRequest(get_palm_service(), payload, update_rephrase);
}

function update_rephrase(result){
	if(result["predictions"] ) {
		var summary = result["predictions"][0]["content"]
		prependItemBody("Rephrased:" + escapeHtml(summary));
		append_debug("DEBUG:"+escapeHtml(summary));
		append_debug("DEBUG:"+JSON.stringify(result));
	} else {
		append_debug("DEBUG:"+JSON.stringify(result));
	}
}


function translate_text(text) {
	
	var payload = {
		
		  "q": text,
		  "target": "de",
		  "format": "text"
	}
	reset_debug()
	append_debug("Sending....");
	SendRequest(translate_service, payload, update_translation);
}

function update_translation(result){
	if(result["data"]) {
		var content = result["data"]["translations"][0]["translatedText"]
		prependItemBody("Translation:" + escapeHtml(content));
		append_debug("DEBUG:"+escapeHtml(content));
		append_debug("DEBUG:"+JSON.stringify(result));
	} else {
		append_debug("DEBUG:"+JSON.stringify(result));
	}
}



function prompt_generate_text(text) {
	var prompt = document.getElementById("prompt_input").value;
	var payload = {
	  "instances": [
		{ "prompt": "input: "+escapeHtml(text) + ". " + prompt + ":"}
	  ],
	  "parameters": {
		"temperature": 0.2,
		"maxOutputTokens": 256,
		"topK": 40,
		"topP": 0.95
	  }
	};
	reset_debug()
	append_debug("Generating...."+prompt);
	SendRequest(get_palm_service(), payload, update_prompt_result);
}

function update_prompt_result(result){
	if(result["predictions"] ) {
		var summary = result["predictions"][0]["content"]
		prependItemBody("Prompt result:" + escapeHtml(summary));
		append_debug("DEBUG:"+escapeHtml(summary));
		append_debug("DEBUG:"+JSON.stringify(result));
	} else {
		append_debug("DEBUG:"+JSON.stringify(result));
	}
}

function update_tone(result){
	if(result["predictions"] ) {
		var safety_attributes = result["predictions"][0]["safetyAttributes"]
		var categories = safety_attributes["categories"]
		var blocked = safety_attributes["blocked"]
		var sentiment = result["predictions"][0]["content"]
		if (blocked || categories.includes("Toxic")) {
			show_inpolite();
		}else if (sentiment == "polite"){
			show_polite();
		} else if (sentiment == "negative") {
			show_inpolite();
		} else {
			show_positive();
		}
		
		//document.getElementById("item-subject").innerHTML = "DEBUG:"+sentiment;
		append_debug("DEBUG:"+JSON.stringify(result));
		append_debug("categories:"+categories);
		append_debug("Sentiment:"+sentiment);
		
	} else {	
		append_debug("DEBUG:"+JSON.stringify(result));
	}
}

function update_sentiment(result){
	if(result["predictions"] ) {
		var sentiment = result["predictions"][0]["content"]
		if (sentiment == "negative"){
			show_negative();
		} else if (sentiment == "negative") {
			show_positive();
		} else {
			show_positive();
		}
		
		//document.getElementById("item-subject").innerHTML = "DEBUG:"+sentiment;
		append_debug("DEBUG:"+JSON.stringify(result));
		//document.getElementById("item-subject").innerHTML = "DEBUG:"+JSON.stringify(result);
	} else {	
		append_debug("DEBUG:"+JSON.stringify(result));
		//document.getElementById("item-subject").innerHTML = "DEBUG:"+JSON.stringify(result);
	}
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

function reset_debug(){
	document.getElementById("debug").innerHTML = "";
}

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


function show_config_form_init(){
	document.getElementById("project_id_config_input").value = project_id;
	document.getElementById("location_config_input").value = location;
	document.getElementById("token_config_input").value = token;
	show_config_form();
}

function show_config_form(){
	document.getElementById("config_table").style.display = "";
	document.getElementById("main_table").style.display = "none";
}

function show_main_table(){
	document.getElementById("config_table").style.display = "none";
	document.getElementById("main_table").style.display = "";
}