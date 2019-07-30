// 注册
Vue.component('cc', {
    template: '<div><p>text:{{text}}#{{unicomId}}</p><p>msg: {{msg}}</p></div>',
    unicomName: 'c',
    unicom: {
        message: function({$1}){
            console.log(arguments)
            this.msg = $1
        }
    },
    data: function(){
        return {
            text: 'component - c',
            msg: ''
        }
    }
})