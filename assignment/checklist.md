## Requirements
Your Express application must implement the following operations as part of a
RESTFul API:

### Reading all data records
- Going to show full list of expenses with their own user id. 
- Super admin can see all the expenses.

### Search for data records given search terms
- Allow users to search with query. (Search by: Category Type, date, paymentType, Status)
- Allow users to search with a limit. 

### Creating a new data record
Allow users to add new record to the database. (With their own route)

### Updating an existing data record
- Users to update a category tag and update to collection for categories. (Challenge)
- User to update one of the record. 

### Deleting an existing record
- Super Admin to remove all the records with GIRO (Challenge)
- Users can only delete their own records.

### User Authentication and Registration
- There must be a RESTFul route that allows new user to sign up
- The user's password must be hashed in the database
- There must be a RESTFul route that allow users to get a JSON Web Token
- There must be at least one route that only authenticated users may access