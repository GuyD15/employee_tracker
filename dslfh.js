const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();

const dbConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

dbConnection.connect((err) => {
    if (err) throw err;
    console.log(`Connected as id ${dbConnection.threadId}\n`);
    startApp();
});

const startApp = () => {
    inquirer
        .prompt([
            {
                name: 'initialInquiry',
                type: 'rawlist',
                message: 'Welcome to the employee management program. What would you like to do?',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'View all employees by manager',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update employee\'s role',
                    'Update employee\'s manager',
                    'Remove a department',
                    'Remove a role',
                    'Remove an employee',
                    'View total salary of department',
                    'Exit program',
                ],
            },
        ])

        .then((response) => {
            switch (response.initialInquiry) {
                case 'View all departments':
                    viewAllDepartments();
                    break;
                case 'View all roles':
                    viewAllRoles();
                    break;
                case 'View all employees':
                    viewAllEmployees();
                    break;
                case 'View all employees by manager':
                    viewAllEmployeesByManager();
                    break;
                case 'Add a department':
                    addADepartment();
                    break;
                case 'Add a role':
                    addARole();
                    break;
                case 'Add an employee':
                    addAnEmployee();
                    break;
                case 'Update an employee\'s role':
                    updateEmployeeRole();
                    break;
                case 'Update an employee\'s manager':
                    updateEmployeesManager();
                    break;
                case 'Remove a department':
                    removeADepartment();
                    break;
                case 'Remove a role':
                    removeARole();
                    break;
                case 'Remove an employee':
                    removeAnEmployee();
                    break;
                case 'View total salary of department':
                    viewDepartmentSalary();
                    break;
                case 'Exit program':
                    dbConnection.end();
                    console.log('\nYou have exited the Employee Management Program. Thanks for using!\n');
                    return;
                default:
                    break;
            }
        });
};

const customConsoleTable = (data) => {
    console.log('\n');
    data.forEach((item) => {
        console.log(item);
    });
    console.log('\n');
};

const viewAllDepartments = () => {
    dbConnection.query(`SELECT * FROM department ORDER BY department_id ASC;`, (err, res) => {
        if (err) throw err;
        customConsoleTable(res);
        startApp();
    });
};

const viewAllRoles = () => {
    dbConnection.query(`SELECT role.role_id, role.title, role.salary, department.department_name, department.department_id FROM role JOIN department ON role.department_id = department.department_id ORDER BY role.role_id ASC;`, (err, res) => {
        if (err) throw err;
        customConsoleTable(res);
        startApp();
    });
};

const viewAllEmployees = () => {
    dbConnection.query(`SELECT e.employee_id, e.first_name, e.last_name, role.title, department.department_name, role.salary, CONCAT(m.first_name, ' ', m.last_name) manager FROM employee m RIGHT JOIN employee e ON e.manager_id = m.employee_id JOIN role ON e.role_id = role.role_id JOIN department ON department.department_id = role.department_id ORDER BY e.employee_id ASC;`, (err, res) => {
        if (err) throw err;
        customConsoleTable(res);
        startApp();
    });
};

const viewAllEmployeesByManager = () => {
    dbConnection.query(`SELECT employee_id, first_name, last_name FROM employee ORDER BY employee_id ASC;`, (err, res) => {
        if (err) throw err;
        const managers = res.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.employee_id,
        }));
        inquirer
            .prompt([
                {
                    name: 'manager',
                    type: 'rawlist',
                    message: 'Which manager would you like to see the employees of?',
                    choices: managers,
                },
            ])
            .then((response) => {
                dbConnection.query(
                    `SELECT e.employee_id, e.first_name, e.last_name, role.title, department.department_name, role.salary, CONCAT(m.first_name, ' ', m.last_name) manager FROM employee m RIGHT JOIN employee e ON e.manager_id = m.employee_id JOIN role ON e.role_id = role.role_id JOIN department ON department.department_id = role.department_id WHERE e.manager_id = ${response.manager} ORDER BY e.employee_id ASC`, 
                    (err, res) => {
                        if (err) throw err;
                        customConsoleTable(res);
                        startApp();
                    }
                );
            });
    });
};

const addADepartment = () => {
    inquirer
        .prompt([
            {
                name: 'newDept',
                type: 'input',
                message: 'What is the name of the department you want to add?',
            },
        ])
        .then((response) => {
            dbConnection.query(
                `INSERT INTO department SET ?`,
                {
                    department_name: response.newDept,
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`\n${response.newDept} successfully added to the database!\n`);
                    startApp();
                }
            );
        });
};
const addARole = () => {
    dbConnection.query(`SELECT * FROM department;`, (err, res) => {
        if (err) throw err;
        const departments = res.map((department) => ({
            name: department.department_name,
            value: department.department_id,
        }));
        inquirer
            .prompt([
                {
                    name: 'title',
                    type: 'input',
                    message: 'What is the name of the role you want to add?',
                },
                {
                    name: 'salary',
                    type: 'input',
                    message: 'What is the salary of the role you want to add?',
                },
                {
                    name: 'deptName',
                    type: 'rawlist',
                    message: 'Which department do you want to add the new role to?',
                    choices: departments,
                },
            ])
            .then((response) => {
                dbConnection.query(
                    `INSERT INTO role SET ?`,
                    {
                        title: response.title,
                        salary: response.salary,
                        department_id: response.deptName,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(`\n${response.title} successfully added to the database!\n`);
                        startApp();
                    }
                );
            });
    });
};

const addAnEmployee = () => {
    dbConnection.query(`SELECT * FROM role;`, (err, res) => {
        if (err) throw err;
        const roles = res.map((role) => ({
            name: role.title,
            value: role.role_id,
        }));
        dbConnection.query(`SELECT * FROM employee;`, (err, res) => {
            if (err) throw err;
            const employees = res.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.employee_id,
            }));
            inquirer
                .prompt([
                    {
                        name: 'firstName',
                        type: 'input',
                        message: 'What is the new employee\'s first name?',
                    },
                    {
                        name: 'lastName',
                        type: 'input',
                        message: 'What is the new employee\'s last name?',
                    },
                    {
                        name: 'role',
                        type: 'rawlist',
                        message: 'What is the new employee\'s title?',
                        choices: roles,
                    },
                    {
                        name: 'manager',
                        type: 'rawlist',
                        message: 'Who is the new employee\'s manager?',
                        choices: employees,
                    },
                ])
                .then((response) => {
                    dbConnection.query(
                        `INSERT INTO employee SET ?`,
                        {
                            first_name: response.firstName,
                            last_name: response.lastName,
                            role_id: response.role,
                            manager_id: response.manager,
                        },
                        (err, res) => {
                            if (err) throw err;
                            console.log(`\n${response.firstName} ${response.lastName} successfully added to the database!\n`);
                            startApp();
                        }
                    );
                });
        });
    });
};
