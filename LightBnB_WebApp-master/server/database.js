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
/**
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

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
/**
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

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
/**
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

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






// --- RESERVATIONS --- // 

// Get all reservations for a single user.
/**
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `
  SELECT properties.*, reservations.*
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2
  `;

  return pool.query(queryString, [guest_id, limit])
    .then(response => {
      return response.rows;
    })
    .catch(err => {
      console.log(err.message);
    });
};

exports.getAllReservations = getAllReservations;







// --- PROPERTIES --- // 
/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */


// QUERYING THE DATABASE
const getAllProperties = (options, limit = 10) => {
  // 1 Empty array holds paramerts that may be availble for the query
  const queryParams = [];

  // 2 Query information that is before the WHERE clause
  let queryString = `
  SELECT properties.*, AVG(property_reviews.rating) as average_rating
  FROM properties 
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3 Check for additional WHERE clauses
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    if (queryParams.length === 1) {
      queryString += `WHERE owner_id = $${queryParams.length}`;
    } else {
      queryString += `AND owner_id = $${queryParams.length}`;
    }
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    if (queryParams.length === 1) {
      queryString += `WHERE cost_per_night >= $${queryParams.length}`;
    } else {
      queryString += `AND cost_per_night >= $${queryParams.length}`;
    }
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    if (queryParams.length === 1) {
      queryString += `WHERE cost_per_night <= $${queryParams.length}`;
    } else {
      queryString += `AND cost_per_night <= $${queryParams.length} `;
    }
  }

  // 4 Add queries that come after WHERE clause, before HAVING
  queryString += `
  GROUP BY properties.id
  `;

  // 5 Add HAVING clause
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }

  // 6 Add ORDER BY and LIMIT 
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5 Check the correct query is being created
  console.log(queryString, queryParams);

  // 6 Run the query
  return pool.query(queryString, queryParams)
    .then(res => {
      return res.rows;
    })
    .catch(err => {
      console.log(err.message);
    });
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
exports.addProperty = addProperty;;;;;;;;;
