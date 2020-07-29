class Compile{
    constructor(el,vm){
        console.log(el,vm);
        this.el = this.isElementNode(el)?el:document.querySelector(el);
        this.$vm = vm;
        if(this.el){
            // 如果元素存在，才会继续向下编译
            
            // 1.先把元素中的dom放入到内存中操作  fragment
            const fragment = this.node2fragment(this.el);

            // 2.编译。提取到元素节点和文本节点。(编译v-mode和{{}})
            this.compile(fragment);



            // 3.把编译好的fragment再放回到元素中


            


        }
    }

    /** 辅助方法**/
    // 判断元素是不是元素节点
    isElementNode(node){
        // 如果是元素节点它的nodeType = 1
        return node.nodeType === 1;
    }
    // 判断属性是否是指令
    isDriective(name){
        // 检测属性中是否存在 v- 的属性
        return name.includes('v-');
    }

    /** 核心方法**/
    // 将el中的节点转换魏fragment
    node2fragment(el){
        // 创建一个 fragment 对象
        let fragment = document.createDocumentFragment();
        let firstChild;
        // 将el中的元素依次移入到fragment中。appendChild 会移除原来的元素
        while(firstChild = el.firstChild){
            fragment.appendChild(firstChild);
        }
        return fragment;
    }

    // 编译
    compile(fragment){
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if(this.isElementNode(node)){
                // 元素节点
                
                // 编译元素节点
                this.compileElement(node);

                // 通过递归获取元素节点下的子元素节点
                this.compile(node);

            }else{
                //文本节点

                //编译文本节点
                this.complieText(node);
            }
        });
        this.el.appendChild(fragment);
        fragment = null;
    }
    compileElement(node){
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name;
            if(this.isDriective(attrName)){
                // 如果是指令, 取到data中的值放入到元素中
                let expr = attr.value;
                let type = attrName.substring(2);
                CompileUtil[type](node,this.$vm,expr);
                // 需要用到 node data expr
            }
        })
    }
    complieText(node){
        let expr = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g;
        if(reg.test(expr)){
            CompileUtil.text(node,this.$vm,expr);
        }
    }
}

CompileUtil = {
    getValue(vm,expr){
        // 这里是通过data和标识来取值，但是标识可能是 message.a.b  这时需要一层一层的取值
        // 先把message.a.b -> ['message','a','b']。 
        // 取值时 先取data[message]再取data[message][a]。
        // 利用reduce
        expr = expr.split('.');
        return expr.reduce((perv,next) => {
            return perv[next];
        },vm.$data);
    },
    getTextContentValue(vm,expr){
        // 由于文本编译时取到的标识魏 {{message}} 所以这里要把真正标识取出来 也就是message
        // 然后再通过上面的getValue 取到data中对应的值。
        let reg = /\{\{([^}]+)\}\}/g;
        let value = expr.replace(reg,(...reset) => {
            return this.getValue(vm,reset[1])
        });
        return value;
    },
    setData(vm,expr,value){
        expr = expr.split('.');
        expr.reduce((perv,next,index) => {
            if(index === expr.length - 1){
                perv[next] = value;
            }
            return perv[next];
        },vm.$data)
    },
    text(node,vm,expr){
        // 编译文本
        let value =  this.getTextContentValue(vm,expr);
        let updateFn = this.updater.textUpdater;
        updateFn&&updateFn(node,value);
        // 编译文本时 添加watcher
        // 文本可能会有多个标识 {{message.a}} {{message.b}}
        // 需要添加多个watcher
        let reg = /\{\{([^}]+)\}\}/g;
        expr.replace(reg,(...reset) => {
            new Watcher(vm,reset[1],() => {
                let updateFn = this.updater.textUpdater;
                updateFn&&updateFn(node,this.getTextContentValue(vm,expr));
            })
        });
        
    },   
    model(node,vm,expr){
        // 编译v-model指令
        let value = this.getValue(vm,expr);
        let updateFn = this.updater.modelUpdater;
        updateFn&&updateFn(node,value);
        // 编译v-model指令给对应的元素添加watcher
        new Watcher(vm,expr,(newValue) => {
            let updateFn = this.updater.modelUpdater;
            updateFn&&updateFn(node,newValue);
        })
        // v-mode指令只能在输入框中使用 ，所以给当前节点添加监听input事件
        node.addEventListener('input',(e) => {
            let newValue = e.target.value;
            // 给data中的标识设置值
            this.setData(vm,expr,newValue);
        })
    },
    updater:{
        // 文本编译方法
        textUpdater(node,value){
            node.textContent = value;
        },
        // v-mode指令编译
        modelUpdater(node,value){
            node.value = value;
        }
    } 

}