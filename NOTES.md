- Separate Activities collection vs storing checkedInAt and checkedOutAt in people collection
    - Activities collection
        - Pros
            - every check in and check out can be recorded, making it easier to track history
            - can be used to generate reports if need be
        - Cons
            - a separate collection to manage
            - need complex aggregation to get the current status of a person

    - checkedInAt and checkedOutAt in people collection
        - Pros
            - simple to manage
            - simple to get the current status of a person, no aggregation needed
        - Cons
            - cannot track history
            - cannot generate reports
    
    - Decision
        - Since an event host is going to be checking in and out users and that users themselves are not going to be checking in and out, there appears to be no need to track history or generate reports. Hence, we will go with the second option of storing checkedInAt and checkedOutAt in people collection


- Handling 5sec delay in check-in/check-out
    - Feature
        - when event host checks in an user, the checkout button should be available only after 5 seconds

    - Initial thoughts
        - Set up a function to run every second in the backend to check if 5 seconds have passed since the user was checked in
        - If 5 seconds have passed, then publish those user ids to the client
        - The client will then rerender those user ids
        - For scalability, I thought of using SyncedCron package to run the function every second

    - Final thoughts
        - The above approach is unnecessarily complex and not a requirement
        - The event host can simply check in a user and then wait for 5 seconds before checking out the user. This action is done by a human, hence no need for a scalable solution
        - Having a function to run every second is not correct. Since different users can be checked in at different times, the interval might overshoot the 5 seconds for some users i.e., the event host might have to wait for 5 seconds for some users and anywhere between 5 and 6 seconds for some other users
        - The interval function will be running every second even when there are no users to check out, which is a waste of resources

    - Decision
        - Use a timeout of 5 seconds in the client to defer the action of enabling the checkout button
        - This is way simpler and more precise than the previous approach
        - The timeout is registered for each user that is checked-in and cleared whenever the `person` prop of `ActionButton` changes
