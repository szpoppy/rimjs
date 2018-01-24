// 注册
Vue.component('cc', {
    template: '<div><p>text:{{text}}#{{unicomId}}</p><p>msg: {{msg}}</p></div>',
    unicomName: 'c',
    unicom: {
        message: function(sender, text){
            this.msg = text
        }
    },
    data: function(){
        return {
            text: 'component - c',
            msg: ''
        }
    }
})