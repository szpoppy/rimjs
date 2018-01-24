// 注册
Vue.component('ca', {
    template: '<div><p>text:{{text}}#{{unicomId}}</p><p>msg: {{msg}}</p></div>',
    unicomName: 'a',
    unicom: {
        message: function(sender, text){
            this.msg = text
        }
    },
    data: function(){
        return {
            text: 'component - ca',
            msg: ''
        }
    }
})