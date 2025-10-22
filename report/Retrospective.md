TEMPLATE FOR RETROSPECTIVE (Team 03)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 

  2 vs 2
- Total points committed vs. done 

  8 vs 8
- Nr of hours planned vs. spent (as a team)

   58 vs 63

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _Uncategorized_|     9    |          |  17h 30m   |       28h      |
| #Get Ticket |    13     |     5   | 16h 30m  |    23h         |  
| #Next Customer|    16     |     3   | 24h  |    11h 30 m         |  

> story `Uncategorized` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |   1.53h   |  0.26h     | 
| Actual     |  1.65h     |    0.95h   |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated

        2h
  - Total hours spent

        1h 30m
  - Nr of automated unit test cases 

        +8

    
  - Coverage
  
        ?!


    
- E2E testing:
  - Total hours estimated

        3h
  - Total hours spent

        1h
  - Nr of test cases

        +3
    


- Code review 
  - Total hours estimated 

        5h
  - Total hours spent

        7h 30m



## ASSESSMENT

- What did go wrong in the sprint?

      - we have to spend more time in the definition of the task 

      - the organitation of folder on github 

      - don't make test avaible to everybody

- What caused your errors in estimation (if any)?

      -we don't speak enough on the division of work and technical part 

- What lessons did you learn (both positive and negative) in this sprint?

       - we have to improve the suddivision of task, work and structure of project
       - we are a good group and we help each other, when needed

- Which improvement goals set in the previous retrospective were you able to achieve? 

      - we are able to complete all the stories we want to do
  
- Which ones you were not able to achieve? Why?

      - We don't do all the task of the second story, beacause some of them are not usefull for the implementation of the story

 - Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Propose one or two
       - create the structure of the project before starting coding, so the code could be more easy to read and found 
       - more attention in the creation of task, to avoid uncertainty on the work to do, to realize it
- One thing you are proud of as a Team!!
  
      - cooperation and union