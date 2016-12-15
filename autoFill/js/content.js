//登录次数 连续登录5此不成功则取消登录
var loginCount = 0;

//接收或发送数据
chrome.runtime.onMessage.addListener(
	function(msg, sender, sendResponse) {

		if( msg.username !== undefined ){
			//拿到username password数据并填写提交表单
			sendResponse("yes");
			onFillForm(msg.username, msg.password);
		}else{
			//获取岂同缓冲页码的username password url并返回到插件background.js中
			sendResponse(getLoginValue());
		}
	}
);

// 获取岂同缓冲页面的数据
function getLoginValue(){

	var loginMsg = {
		url: "",
		username: "",
		password: "",
	}

	var urlElement = document.getElementById("qt_url_input");
	var usernameElement = document.getElementById("qt_username_input");
	var pwdElement = document.getElementById("qt_password_input");

	loginMsg.url = Trim(urlElement.getAttribute("value"),"g");
	loginMsg.username = Trim(usernameElement.getAttribute("value"),"g");
	loginMsg.password = Trim(pwdElement.getAttribute("value"),"g");

	// console.log("======get url:",loginMsg.url,loginMsg.url.length);
	// console.log("======get username:",loginMsg.username,loginMsg.username.length);
	// console.log("======get password:",loginMsg.password,loginMsg.password.length);

	return loginMsg;
}

//删除前后空格，删除全部空格第二个参数写g
function Trim(str,is_global){

	var result;

	result = str.replace(/(^\s+)|(\s+$)/g,"");

	if(is_global.toLowerCase()=="g"){
		result = result.replace(/\s/g,"");
	}

	return result;
}

// todo 为空时的判断以及处理
//  input经常无法准确匹配

//选择用户名输入框
function selectUsernameInput(formElement){

	var formChildElement = formElement;
	var inputList = null;
	var uNameInput = null;

	if( formChildElement != null ){
		inputList = formChildElement.getElementsByTagName("input");
	}else{
		inputList = document.getElementsByTagName("input");
	}

	for (var i = 0; i < inputList.length; i++) {

		if ( inputList[i].getAttribute("type") == "text" ){

			if(	inputList[i].getAttribute("name").toLowerCase() .indexOf("username") != -1 
				|| inputList[i].getAttribute("name").toLowerCase() .indexOf("account") != -1 
				|| inputList[i].getAttribute("name").toLowerCase() .indexOf("userid") != -1 
				|| inputList[i].getAttribute("name").toLowerCase() .indexOf("user_name") != -1 
				|| inputList[i].getAttribute("name").toLowerCase() .indexOf("email") != -1){

				uNameInput =  inputList[i];
				break;

			}else if( i == inputList.length-1 ){

				uNameInput =  inputList[0];

			}

		}

	}

	return uNameInput;
}

//选择密码输入框
function selectPwdInput(){

	var inputList = document.getElementsByTagName("input");
	var pwdInput = null;

	for (var i = 0; i < inputList.length; i++) {

		if ( inputList[i].getAttribute("type") == "password" ){
			pwdInput= inputList[i];
			break;
		}
	}

	return pwdInput;
}

//选择登录按钮
function selectLoginBtn(formElement){

	var formChildElement = formElement;

	var inputList = null;
	var btnList = null;
	var submitBtn=null;

	// 循环所有btn/ input查询type="submit"的btn
	function selectSubmitBtnFromList(arr){
		var subBtn = null;

		for (var i = 0; i < arr.length; i++) {

			if (arr[i].getAttribute("type") == "submit"){
				subBtn = arr[i];
				break;
			}
		}

		return subBtn;
	}

	// 循环所有input查询type="button"的input
	function selectInputBtnList(arr){
		var inputBtnList = [];

		for (var i = 0; i < arr.length; i++) {

			if (arr[i].getAttribute("type") == "button"){
				inputBtnList.push(arr[i]);
			}
		}

		return inputBtnList;
	}


	// 循环所有btn/  input type="button" value="login"/"登录"
	function selectLoginBtnInFromList(arr){
		var subBtn = null;

		for (var i = 0; i < arr.length; i++) {

			if( arr[i].tagName.toLowerCase() == "button" ){
				if (	Trim(arr[i].innerText,"g").indexOf("登录") != -1 
					|| Trim(arr[i].innerText,"g").toLowerCase().indexOf("login") != -1 ){

					subBtn = arr[i];
					break;

				}
			}else if( arr[i].tagName.toLowerCase() == "input" ){
				if (	Trim(arr[i].getAttribute("value"),"g") == "登录" 
					|| Trim(arr[i].getAttribute("value"),"g").toLowerCase().indexOf("login") != -1 ){

					subBtn = arr[i];
					break;

				}
			}

		}

		return subBtn;
	}

	if( formChildElement != null ){

		inputList = formChildElement.getElementsByTagName("input");
		btnList = formChildElement.getElementsByTagName("button");

		// 查询 input type=“submit”的第一项
		submitBtn = selectSubmitBtnFromList(inputList);

		// 查询 button type=“submit”的第一项
		if( submitBtn == null ){
			submitBtn = selectSubmitBtnFromList(btnList);
		}

		// 查询 input type="button" 中value包含"login"/”登录“的第一项
		if( submitBtn == null ){
			inputList = selectInputBtnList(inputList);
			submitBtn = selectLoginBtnInFromList(inputList);
		}
			
		// 查询 button标签文本包含"login"/”登录“的第一项
		if (  submitBtn == null ) {
			submitBtn = selectLoginBtnInFromList(btnList);
		}

	}else{

		inputList = document.getElementsByTagName("input");
		submitBtn = selectSubmitBtnFromList(inputList);

		if( submitBtn == null ){
			btnList = document.getElementsByTagName("button");
			submitBtn = selectSubmitBtnFromList(btnList);
		}

		if( submitBtn == null ){
			inputList = selectInputBtnList(inputList);
			submitBtn = selectLoginBtnInFromList(inputList);
		}
			
		if (  submitBtn == null ) {
			submitBtn = selectLoginBtnInFromList(btnList);
		}

	}

	// if( submitBtn == null ){
	// 	submitBtn = document.getElementsByTagName("button")[0];
	// }

	return submitBtn;
}

//选择登录Form表单
function selectLoginForm(pwdElement){

	var formChildElement = pwdElement;

	if( formChildElement != null ){

		do{
			formChildElement = formChildElement.parentNode;
			if( formChildElement.tagName.toLowerCase() == "form" ){
				return formChildElement;
			}
		}while( formChildElement.parentNode.tagName.toLowerCase() != "body" );

	}else{
		
		var formList = document.getElementsByTagName("form");

		for (var i = 0; i < formList.length; i++) {

			if (formList[i].getAttribute("method").toLowerCase() == "post"){
				return formList[i];
			}else if(  i == formList.length-1 ){
				return formList[0];
			}
		}
		
	}

}

//填充表单并提交
function onFillForm(username,password){

	// console.log("==username==",username,"==password===",password);

	//得到pwd input
	var passwordInput = selectPwdInput();
	console.log("===input pwd=",passwordInput);

	//得到提交form
	var submitForm = selectLoginForm(passwordInput);
	console.log("===表单=",submitForm);

	//得到username input
	var userNameInput = selectUsernameInput(submitForm);
	console.log("===input username=",userNameInput);


	//得到提交btn 或input[type="submit"]
	var submitButton = selectLoginBtn(submitForm);
	console.log("===按钮=",submitButton);

	// 给元素填充值
	if( userNameInput != null ){
		userNameInput.value=username;
	}

	if( passwordInput != null ){
		passwordInput.value=password;
	}

	// 触发登录事件
	console.log("==登录用户名==",userNameInput.getAttribute("value"),"==登录密码===",passwordInput.getAttribute("value"));
	if( submitForm != null ){

		if( submitButton != null ){
			console.log("按钮提交表单");
			submitButton.click();
			return;
		}

		console.log("表单提交");
		submitForm.submit();

	}else if( submitButton != null ){

		console.log("按钮点击提交");
		submitButton.click();	

	}

}