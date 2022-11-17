const properties = require('./json/properties.json');
const users = require('./json/users.json');

// DATABASE CONNECTION
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


// --- USERS --- // 

// Get a single user from the database given their email
const getUserWithEmail = function(email) {
  const queryString = `
  SELECT * 
  FROM users
  WHERE users.email = $1
  `;

  return pool.query(queryString, [email])
    .then(response => {
      if (response.rows) {
        return response.rows[0];
      } else {
        return null;
      }
    })
    .catch(err => {
      console.log(err.message);
    });
};

exports.getUserWithEmail = getUserWithEmail;

// Get a single user from the database given their ID
const getUserWithId = function(id) {
  const queryString = `
  SELECT * 
  FROM users
  WHERE users.id = $1
  `;

  return pool.query(queryString, [id])
    .then(response => {
      if (response.rows) {
        return response.rows[0];
      } else {
        return null;
      }
    })
    .catch(err => {
      console.log(err.message);
    });
};

exports.getUserWithId = getUserWithId;


// Add a new user to the database.
const addUser = function(user) {
  const queryString = `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `;

  return pool.query(queryString, [user.name, user.email, user.password])
    .then(response => {
      return response.rows[0];
    })
    .catch(err => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return getAllProperties(null, 2);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */


// QUERYING THE DATABASE
const getAllProperties = (options, limit = 10) => {
  return pool.query(`
  SELECT * 
  FROM properties 
  LIMIT $1
  `, [limit])
    .then((response) => {
      console.log(response.rows);
      return response.rows;
    })
    .catch((err) =>
      console.log(err.message));
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
