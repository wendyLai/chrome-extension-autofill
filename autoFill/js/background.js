//内置用户名密码url
var loginMsg = {
	url 		: null,
	username 	: null,
	password 	: null,
};

//缓冲页面
var pageSkipSrc =  "/swa/sso/post/";

//用于阻止本地刷新登录
var loginCount = null;

//保存流程状态
var curStatus = "togetmsg"; // togetmsg → tofillmsg → tologin

//将用户名密码发送到content中(页面元素属性才能被赋值)
function sendMsgToLoginContent(tab){
	console.log("发送数据");
	chrome.tabs.sendMessage(tab.id, {username: loginMsg.username, password: loginMsg.password, url: loginMsg.url}, function(response) {

		if( response !== undefined && curStatus != "tologin" ){
			loginCount++;
		}

		if( response !== undefined ){
			console.log("接收到登录数据,第"+loginCount+"次开始进行填充表单登录操作。");
			curStatus = "tologin";
		}else{
			console.log("接收登录数据中......");
		}

	});
}

//从岂同页面中获取到我们需要的用户名密码url数据
function getLoginMsgFormQt(tab){
	chrome.tabs.sendMessage(tab.id, {}, function(response) {
		console.log("拿到岂同页面的登录数据:",response.url,response.username,response.password);

		if( response.url != null ){
			loginMsg.url = response.url;
		}
		if( response.username != null ){
			loginMsg.username = response.username;
		}
		if( response.password != null ){
			loginMsg.password = response.password;
		}

		if( loginMsg.url != null && loginMsg.username != null && loginMsg.password != null ){
			curStatus = "tofillmsg";
			loginCount = 0;//第一次登录
		}
	});
}

// 加载后动作（1 对的url中显示ico 2对的url中填充表单）
function checkForValidUrl(tabId, changeInfo, tab) {
	// console.log("tabId=",tabId,"changeInfo=",changeInfo,"tab=",tab,"\n","==cabbage===",tab.url.toLowerCase().indexOf("http://qq.cabbage.com/")!=-1);

	console.log("****************************************************************8");
	// console.log("开始监听=状态为===",curStatus);
	// console.log("开始监听=登录次数为===",loginCount);	

	if( tab.url.toLowerCase().indexOf(pageSkipSrc) != -1 ){

		//在岂同页面中 获取数据填入loginMsg中
		chrome.pageAction.show(tabId);
		getLoginMsgFormQt(tab);

	}

	//允许第二次登录
	if ( curStatus == "tofillmsg" ) {
		console.log("现在发送数据到登录页面，并开始填充表单");
		if( tab.url.toLowerCase() == loginMsg.url || tab.url.toLowerCase().indexOf(loginMsg.url) != -1 ){
			//在登录页面中 将数据填入表单中 登录操作
			chrome.pageAction.show(tabId);
			sendMsgToLoginContent(tab);
		}
	}else if( loginCount == 1 ){
		console.log("再次登录");
		curStatus = "tofillmsg";
	}

};

// 添加监听
chrome.tabs.onUpdated.addListener(checkForValidUrl);
