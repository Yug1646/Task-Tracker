import express from "express";

const PORT = process.env.PORT;
const app = express();

app.use(express.json());

const tasks = [];

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

/* 
    ---------- MIDDLEWARE ---------- 
*/
const taskId = (req, res, next) => {
  const parsedId = parseInt(req.params.id);

  if (isNaN(parsedId))
    return res.status(400).json({ message: "Invalid Task Id" });

  req.taskId = parsedId; // attach to req
  next();
};

/*
    ---------- HTTP REQUESTS ---------- 
*/
app.get("/", (req, res) => {
  res.status(200).json(tasks);
});

// GET TASK BY STATUS
app.get("/api/task", (req, res) => {
  const {
    query: { filter, value },
  } = req;
  if (filter && value) {
    return res.status(200).json(
      tasks.filter((task) => {
        return (
          task[filter] !== undefined && String(task[filter]).includes(value)
        );
      }),
    );
  }
  return res.status(200).json(tasks);
});

app.post("/api/task", (req, res) => {
  const { body } = req;

  const now = new Date().toLocaleString();
  //   MULTIPLE TASKS
  if (Array.isArray(body)) {
    let currentId = tasks.length > 0 ? tasks[tasks.length - 1].id : 0;
    const newTasks = body.map((task) => {
      currentId++;
      return { id: currentId, ...task, createdAt: now, updatedAt: now };
    });

    tasks.push(...newTasks);
    return res.status(201).json(newTasks);
  }
  // SINGLE TASK
  const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
  const newTask = { id: newId, ...body, createdAt: now, updatedAt: now };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put("/api/task/:id", taskId, (req, res) => {
  const { body, taskId } = req;
  const taskIndex = tasks.findIndex((task) => taskId === task.id);
  const now = new Date().toLocaleString();

  if (taskIndex === -1)
    return res.status(404).json({ message: "Task not found" });

  const existingTask = tasks[taskIndex];

  const updatedTask = {
    ...existingTask,
    ...body,
    id: existingTask.id,
    createdAt: existingTask.createdAt || now,
    updatedAt: now,
  };
  tasks[taskIndex] = updatedTask;
  return res.status(200).json(updatedTask);
});

app.patch("/api/task/:id", taskId, (req, res) => {
  const { body, taskId } = req;
  const taskIndex = tasks.findIndex((task) => taskId === task.id);
  const now = new Date().toLocaleString();
  console.log(taskIndex);
  if (taskIndex === -1)
    return res.status(404).json({ message: "Task not found" });

  const existingTask = tasks[taskIndex];

  const updatedTask = {
    ...existingTask,
    ...body,
    id: existingTask.id,
    createdAt: existingTask.createdAt || now,
    updatedAt: now,
  };
  tasks[taskIndex] = updatedTask;
  return res.status(200).json(updatedTask);
});

app.delete("/api/tasks", (req, res) => {
  tasks.splice(0, tasks.length);
  return res.status(200).json({ message: "All Task deleted" });
});

app.delete("/api/task/:id", taskId, (req, res) => {
  const { taskId } = req;
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index === -1) return res.status(404).json({ message: "Task not found" });

  tasks.splice(index, 1);
  res.status(200).json({ message: "Task deleted successfully" });
});
