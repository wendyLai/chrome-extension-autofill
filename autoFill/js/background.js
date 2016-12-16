//内置用户名密码url
var loginMsg = {
	url 		: null,
	username 	: null,
	password 	: null,
};

//缓冲页面
var pageSkipSrc =  "/swa/sso/post/";

//用于阻止本地刷新登录
var toLoginCount = 0;

//将用户名密码发送到content中(页面元素属性才能被赋值)
function sendMsgToLoginContent(tab){
	chrome.tabs.sendMessage(tab.id, {username: loginMsg.username, password: loginMsg.password, url: loginMsg.url}, function(response) {

		if( response !== undefined ){
			console.log("接收到登录数据:",response);
			toLoginCount = 0;
		}else{
			console.log("接收登录数据中......");
		}

	});
}

//从岂同页面中获取到我们需要的用户名密码url数据
function getLoginMsgFormQt(tab){
	chrome.tabs.sendMessage(tab.id, {}, function(response) {
		// console.log("拿到登录数据了吗？",response.url,response.username,response.password);
		loginMsg.url = response.url;
		loginMsg.username = response.username;
		loginMsg.password = response.password;
		toLoginCount++;
	});
}

// 加载后动作（1 对的url中显示ico 2对的url中填充表单）
function checkForValidUrl(tabId, changeInfo, tab) {
	// console.log("tabId=",tabId,"changeInfo=",changeInfo,"tab=",tab,"\n","==cabbage===",tab.url.toLowerCase().indexOf("http://qq.cabbage.com/")!=-1);

	console.log("toLoginCount=",toLoginCount);
	
	if( tab.url.toLowerCase().indexOf(pageSkipSrc) != -1 ){

		//在岂同页面中 获取数据填入loginMsg中
		chrome.pageAction.show(tabId);
		getLoginMsgFormQt(tab);

	}

	if ( toLoginCount == 1 ) {
		// console.log("现在开始登录，登录信息为：");
		// console.log(loginMsg);
		if( tab.url.toLowerCase() == loginMsg.url || tab.url.toLowerCase().indexOf(loginMsg.url) != -1 ){
			//在登录页面中 将数据填入表单中 登录操作
			chrome.pageAction.show(tabId);
			sendMsgToLoginContent(tab);

			// window.onload=function(){
			// }
		}
	}

};

// 添加监听
chrome.tabs.onUpdated.addListener(checkForValidUrl);