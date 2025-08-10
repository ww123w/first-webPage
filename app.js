const express = require('express');
const cors = require('cors');//连接前后端的“通行证”
const mongoose = require('mongoose');//“仓库管理员” Mongoose

const app = express();

app.use(cors());//允许所有来源的跨域请求
app.use(express.json());

// //定义“内存数据库”和初始数据
// //使用 let 代表可修改
// let todos = [
//     { id: 1, text: '学习Express路由', completed: true },
//     { id: 2, text: '完成后端 API 改造', completed: false },
//     { id: 3, text: '学习 fetch API', completed: false }
// ];
// let nextId = 4;// 用一个变量来追踪下一个可用的 ID


//连接MongoDB仓库
const dbURI = 'mongodb+srv://latte:wasd123456@mytodoappcluster.y8t52ps.mongodb.net/?retryWrites=true&w=majority&appName=MyTodoAppCluster';


mongoose.connect(dbURI)
    .then((result) => {
        console.log('成功连接到 MongoDB 大仓库！');
        app.listen(PORT, () => {
            console.log(`服务器已启动，正在监听 ${PORT} 端口...`);
        });
    })

    .catch((err) => {
        console.error('连接数据库失败:', err);
    });

// Schema 就像是给仓库里的每一种货物（比如“待办事项”）制定的一个标准规格清单。
// 它规定了“待办事项”这种货物必须有哪些属性，以及每个属性是什么类型。
const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });// timestamps: true 会自动添加 createdAt 和 updatedAt 两个时间戳字段

// Model 就像是基于这个“规格清单”创建的一个“货物操作工具”
// 以后所有对“待办事项”的增删改查，都通过这个 Todo 模型来操作
const Todo = mongoose.model('Todo', todoSchema);


//获取所有待办事项
app.get('/todos', async(req, res) => {
    try {
        //.find查找所有待办事项
        // .sort({ createdAt: -1 }) 表示按创建时间倒序排列，新的在前面
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: '服务器错误' });
    }
});

//创建新的待办事项
app.post('/todos', async(req, res) => {
    try {
        const newTodo = await Todo.create({
            text: req.body.text   //我们只取 text 字段，其他字段用 Schema 里定义的默认值
        });
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ error: '创建失败，请检查输入' });
    }
});

// 删除指定待办
app.delete('/todos/:id', async(req, res) => {//:id 冒号: 表示这是一个动态的参数
    try {
        const { id } = req.params;
        const deletedTodo = await Todo.findByIdAndDelete(id);//根据 ID 查找并删除一个货物
        if (!deletedTodo) {
            return res.status(404).json({ error: '未找到该待办事项' });
        }
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: '服务器错误' });
    }
});


//更新指定的待办状态
//* HTTP 方法 PATCH：PATCH 用于对资源的部分更新。如果我们想用一个全新的对象替换整个旧对象，通常会用 PUT。在这里，只修改 completed 状态，PATCH 是最合适的。

app.patch('/todos/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const todoToUpdate = await Todo.findById(id);//先用 .findById() 把货物从仓库里找出来
        if (!todoToUpdate) {
            return res.status(404).json({ error: '未找到该待办事项' });
        }
        todoToUpdate.completed = !todoToUpdate.completed;
        const updateTodo = await todoToUpdate.save();//把修改后的货物存回仓库
        res.json(updateTodo);// 返回更新后的货物信息
    }catch (err) {
        res.status(500).json({ error: '服务器错误' });
    }
});

const PORT = 3000;
