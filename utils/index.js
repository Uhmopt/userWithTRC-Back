var createUniqueString = function () {
    const timestamp = +new Date() + ''
    const randomNum = parseInt((1 + Math.random()) * 65536) + ''
    return (+(randomNum + timestamp)).toString(32)
}

var urlify = function (text) {
    var urlRegex = /(https?:\/\/[^\s】]+)/g
    if(text) {
        
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '">' + url + '</a>'
        })
    } else {
        return null;
    }
}

var currentTime = function(){
	return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

var verifyCode = function(min, max){
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}
  
var exports = {
    createUniqueString: createUniqueString,
    urlify: urlify,
    currentTime: currentTime,
    verifyCode: verifyCode
}

module.exports = exports;