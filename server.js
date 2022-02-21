//Letting server.js know all of the modules I will be using for this application
const express = require("express");
const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");

//Establishes connection to the mysql server
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "Every1ne",
    database: "organization",
  },
  console.log(`You are connected to the organization database`)
);

//Calling the function that the user will see when they run the application
DisplayMenu();

//This function allows for the initial display that the user will see
function DisplayMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        choices: ["View Data", "Add Data", "Update Employee Role", "Done"],
        description: "What would you like to do?",
      },
      //This then statement allows all of the options to be chosen
    ])
    .then((res) => {
      switch (res.menu) {
        case "View Data":
          viewData();
          break;
        case "Add Data":
          addData();
          break;
        case "Update Employee Role":
          updateData();
          break;
        default:
          console.log("Goodbye!");
          process.exit();
      }
    });
}
//This function allows the user to view information from the department, role, or employee tables
function viewData() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "selection",
        choices: [
          "View All Departments",
          "View All Roles",
          "View All Employees",
        ],
        description: "Which data would you like to view?",
      },
    ])
    .then((res) => {
      switch (res.selection) {
        case "View All Departments":
          db.query("SELECT * FROM department", (err, data) => {
            if (err) {
              throw err;
            } else {
              console.table(data);
            }
            continueProgram();
          });
          break;
        case "View All Roles":
          db.query("SELECT * FROM role", (err, data) => {
            if (err) {
              throw err;
            } else {
              console.table(data);
            }
            continueProgram();
          });
          break;
        case "View All Employees":
          db.query("SELECT * FROM employee", (err, data) => {
            if (err) {
              throw err;
            } else {
              console.table(data);
            }
            continueProgram();
          });
          break;
        default:
          console.log("Goodbye!");
          process.exit();
      }
    });
}

//This function allows the user to add a department, role, or employee
function addData() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "selection",
        choices: ["Add a Department", "Add a Role", "Add an Employee"],
        description: "What data would you like to add?",
      },
    ])
    .then((res) => {
      switch (res.selection) {
        case "Add a Department":
          addDept();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        default:
          console.log("Goodbye!");
          process.exit();
      }
    });
}
//This function allows the user to go deeper into the decision tree
function continueProgram() {
  inquirer
    .prompt({
      type: "list",
      message: "Would you like to continue?",
      choices: ["Continue", "Exit"],
      name: "continue",
    })
    .then((res) => {
      var confirm = res.continue;
      if (confirm === "Continue") {
        DisplayMenu();
      } else {
        console.log("Goodbye!");
        process.exit();
      }
    });
}

//This function shows current employees based on what is queried
const currentEmployees = () => {
  const holdingArray = [];
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM employee;`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        for (let i = 0; i < data.length; i++) {
          holdingArray.push(data[i].first_name + " " + data[i].last_name);
        }
        resolve(holdingArray);
      }
    });
  });
};

//This function shows current roles based on what is queried
const currentRoles = () => {
  const tempArray = [];
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM role;`, (err, results) => {
      if (err) {
        reject(err);
      } else {
        for (let i = 0; i < results.length; i++) {
          tempArray.push(results[i].title);
        }
        resolve(tempArray);
      }
    });
  });
};

//This function shows current departments based on what is queried
const currentDept = () => {
  const tempArray = [];
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM department;`, (err, results) => {
      if (err) {
        reject(err);
      } else {
        for (let i = 0; i < results.length; i++) {
          tempArray.push(results[i].department_name);
        }
        resolve(tempArray);
      }
    });
  });
};

//This function queries for deptId
const deptId = (res) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM department WHERE department_name = ?`,
      res,
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data[0].id);
        }
      }
    );
  });
};

//This function queries for employee id
const employeeId = (first, last) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`,
      [first, last],
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data[0].id);
        }
      }
    );
  });
};

//This function queries for roleID
const findRoleId = (res) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT id FROM role WHERE title = ?`, res, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data[0].id);
      }
    });
  });
};

//This allows the user to add a role with title, salary, and dept_id properties
function insertRole(title, salary, deptId) {
  db.query(
    "INSERT INTO role(title,salary,dept_id) VALUES (?,?,?)",
    [title, salary, deptId],
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Role added successfully.");
      }
    }
  );
}

//This allows the user to add a role with first, last, role, and manager ID properties
function insertEmployee(first, last, role, manager) {
  db.query(
    `INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)`,
    [first, last, role, manager],
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Role added successfully.");
      }
    }
  );
}

//This function updates the employees information
function updateEmployee(roleId, first, last) {
  db.query(
    "UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?",
    [roleId, first, last],
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Role updated successfully");
        continueProgram();
      }
    }
  );
}

//This function is supposed to add the department, but I can't get it to work
function addDept() {
  inquirer
    .prompt({
      type: "input",
      message: "Please enter the name of the department.",
      name: "department_name",
    })
    .then((res) => {
      db.query(
        "INSERT INTO department(department_name) VALUES (?);",
        res.departmentName,
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log("New department added!");
            continueProgram();
          }
        }
      );
    });
}

//This function asynchronously adds roles
async function addRole() {
  var deptChoices = await currentDept();

  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter the title of the role.",
        name: "title",
      },
      {
        type: "input",
        message: "Please enter the salary for this role.",
        name: "salary",
      },
      {
        type: "list",
        choices: deptChoices,
        message: "Which department would you like to add this role to?",
        name: "dept",
      },
    ])
    .then(async (res) => {
      var title = res.title;
      var salary = res.salary;

      var departmentId = await deptId(res.dept);

      return [title, salary, departmentId];
    })
    .then((res) => {
      insertRole(res[0], res[1], res[2]);
      continueProgram();
    });
}

//This function asynchronously adds employees
async function addEmployee() {
  var roleChoices = await currentRoles();
  var managerList = await currentEmployees();
  managerList.push("No manager");

  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the employees first name?",
        name: "first_name",
      },
      {
        type: "input",
        message: "What is the employees last name?",
        name: "last_name",
      },
      {
        type: "list",
        message: "Please select this employees role.",
        choices: roleChoices,
        name: "role",
      },
      {
        type: "list",
        message: "Please select this employees manager",
        choices: managerList,
        name: "employee",
      },
    ])
    .then(async (res) => {
      var first = res.first_name;
      var last = res.last_name;

      var role = await findRoleId(res.role);

      var managerName = res.employee.split(" ");
      var manager;
      if (res.employee === "No manager") {
        manager = null;
      } else {
        manager = await employeeId(managerName[0], managerName[1]);
      }

      return [first, last, role, manager];
    })
    .then((res) => {
      insertEmployee(res[0], res[1], res[2], res[3]);
      continueProgram();
    });
}

//This function asynchronously adds data
async function updateData() {
  var currentEmp = await currentEmployees();
  var rolesList = await currentRoles();

  inquirer
    .prompt([
      {
        type: "list",
        message: "Which employee role would you like to update?",
        choices: currentEmp,
        name: "employee",
      },
      {
        type: "list",
        message: "What is their new role?",
        choices: rolesList,
        name: "role",
      },
    ])
    .then(async (res) => {
      var roleId = await findRoleId(res.role);

      let employee = res.employee.split(" ");

      updateEmployee(roleId, employee[0], employee[1]);
    });
}
