-- Create the employee_db database if it doesn't exist
CREATE DATABASE IF NOT EXISTS employee_db;

-- Use the employee_db database
USE employee_db;

-- Create the department table
CREATE TABLE department (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(36) NOT NULL
);

-- Create the role table
CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(36) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department (department_id)
);

-- Create the employee table
CREATE TABLE employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(36) NOT NULL,
    last_name VARCHAR(236) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES role (role_id),
);
