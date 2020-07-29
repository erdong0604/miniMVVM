class Observer{
    constructor(data){
        this.data = data;

        this.observe(data);
    }
    observe(data){
        if(!data || typeof data !== 'object'){
            // 如果数据不是对象 不做任何操作
            return;
        }
        // 如果数据是对象  遍历对象给对象上的每个属性添加get set
        let keys = Object.keys(data);
        keys.forEach(key => {
            let value  = data[key];
            this.defineReactive(data,key,value);
            this.observe(value)
        });
    }
    // 给对象当前的属性添加get set
    defineReactive(data,key,value){
        // 获取Observer实例的this
        let that = this;
        let dep = new Dep();
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:true,
            get(){
                // console.log('获取'+key+'执行了get');
                Dep.target&&dep.addSub(Dep.target);
                return value;
            },
            set(newVal){
                // console.log('设置'+key+'执行了get');
                if(newVal !== value){
                    value = newVal;
                    that.observe(newVal);
                    dep.notify();
                }
            }
        })

    }
}

// 发布订阅 
// 收集所有watcher 当有值改变的时候 去调用每个watcher的update方法。 
// 然后调用watcher中的cb更新元素上的值。

class Dep{
    constructor(){
        this.subs = [];
    }
    addSub(watcher){
        console.log(watcher);
        this.subs.push(watcher);
    }
    notify(){
        this.subs.forEach(watcher => {
            watcher.update();
        })
    }
}
