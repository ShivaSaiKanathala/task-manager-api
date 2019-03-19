const express = require('express')
const Tasks = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()

//CREATE TASKS
router.post('/tasks', auth, async (req, res)=>{
    //const tasks = new Tasks(req.body)
    // tasks.status(201).save().then(()=>{
    //     res.send(tasks)
    // }).catch((error)=>{
    //     res.status(400)
    //     res.send(error)
    // })
    const tasks = new Tasks({
        ...req.body,
        owner: req.user._id

    })

    try{
        await tasks.save()
        res.status(201).send(tasks)
    }catch(e){
        res.status(400).send(e)
    }
})

//GET /tasks?completed=false if completed =true only commpleted tasks
//pagination GET /tasks?limit=10&skip=0
router.get('/tasks',auth, async (req,res)=>{
    // Tasks.find({}).then((tasks)=>{
    //     res.send(tasks)
    // })

    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed ==='true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        console.log(parts)
        sort[parts[0]] = parts[1] === 'desc' ? -1: 1
        console.log(sort)
    }

    try{
        
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        //const tasks = await Tasks.find({})
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
    
})


//sorting the taks based on oldest incomplete tasks
//GET /tasks?sortBy=createdAt_asc 0r_desc
 


//READ TASKS BY ID
router.get('/tasks/:id',auth, async (req,res)=>{
    const _id = req.params.id

    // Tasks.findById(_id).then((task)=>{
    //     if(!task){
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
    try{
        //const task = await Tasks.findById(_id)
        const task = await Tasks.findOne({_id, owner:req.user._id})

        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        console.log(e)
    }
    
})

//UPDATE TASKS
router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)//take req from body and convert it into array of keys
    const allowedUpdates=['completed','description']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid Task Updates' })

    }
    
    try{
        //const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
        const task = await Tasks.findOne({_id: req.params.id, owner: req.user._id})

       // const task = await Tasks.findById(req.params.id)
       
        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(404).send(e)
    }
})

//Delete Tasks
router.delete('/tasks/:id', auth, async (req, res)=>{
    try{   
        //const task = await Tasks.findByIdAndDelete(req.params.id)
        const task = await Tasks.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    } 
})


module.exports = router