## Requirements
Your Express application must implement the following operations as part of a
RESTFul API:

### Reading all data records
- Show full list of expenses with their own username. - done
- Super admin can see all the expenses. - done

### Search for data records given search terms
- Allow users to search with query. (Search by: Category Type, date, paymentType, Status) - done
- Allow users to search with a limit. 

### Creating a new data record
Allow users to add new record to the database. (With their own route) - done

### Updating an existing data record
- Super admin to update a category tag and update to collection for categories. (Challenge)
- User to update with time (Challenge)
- User to update one of the record. - done

### Deleting an existing record
- Super Admin to remove all the records with GIRO (Challenge)
- Users can only delete their own records. - done

### User Authentication and Registration - done
- There must be a RESTFul route that allows new user to sign up
- The user's password must be hashed in the database
- There must be a RESTFul route that allow users to get a JSON Web Token
- There must be at least one route that only authenticated users may access