import { useState, useEffect } from 'react'
import personService from './services/persons'

const Person = ({ person }) => {
  return (
    <li>{person.name} {person.number}</li>
  )
}

const areTheseObjectsEqual = (first, second) => {
  if (first.name !== second.name) {
    return false;
  }
  else if (first.name === second.name && first.number !== second.number) {
    return false;
  }   
  return true;
}

const areTheseObjectsPartEqual = (first, second) => {
  if (first.name !== second.name)
  {
    return false;
  }
  return true;
}

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '12-34-5678' }
  ]) 
  const [newPerson, setNewPerson] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filteringParameter, setFilteringParameter] = useState('')
  const [confirmingMessage, setConfirmingMessage] = useState(null)
  const [unsuccessfulEventMessage, setUnsuccessfulEventMessage] = useState(null)
  

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])
  console.log('render', persons.length, 'persons')

  const handlePersonChange = (event) => {
    const enteredName = event.target.value;
    setNewPerson(enteredName);
  }

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newPerson,
      number: newNumber
    }
    if (newNumber === '') {
      window.alert('Enter a number');
    }
    else if (persons.some(item => areTheseObjectsEqual(item, personObject))) {
      (window.alert(`${newPerson} is already added to phonebook`))
      setNewPerson('')
      setNewNumber('')
    }

    else if (persons.some(item => areTheseObjectsPartEqual(item, personObject))) {
      if (window.confirm(`${newPerson} is already added to phonebook, replace the old number with the new one?`)) 
         {
          const exisingPersonId = persons.find(person => person.name === newPerson)?.id;
          if (exisingPersonId) {
            personService
            .update(exisingPersonId, personObject)
            .then(response => {
              const updatedPersons = persons.map(person => person.id === exisingPersonId ? response.data : person);
              setPersons(updatedPersons)
              setConfirmingMessage(
                `Number of '${personObject.name}' changed`
              )
              setTimeout(() => {
                setConfirmingMessage(null)
              }, 5000)
              setNewPerson('')
              setNewNumber('')
            })
            .catch(error => {
              setUnsuccessfulEventMessage(
                `Note '${personObject.name}' was already removed from server`
              )
              setTimeout(() => {
                setUnsuccessfulEventMessage(null)
              }, 5000)
            })  
          }
        
        }
                
        else {
          setNewPerson('')
          setNewNumber('') 
        }  
    }
    else {
      personService
      .create(personObject)
      .then(response => {
        setPersons(persons.concat(response.data))
        setConfirmingMessage(
          `Added '${personObject.name}'`
        )
        setTimeout(() => {
          setConfirmingMessage(null)
        }, 5000)
        setNewPerson('')
        setNewNumber('')
      })
    }
  }

  const handleNumberChange = (event) => {
    const enteredNumber = event.target.value;
    setNewNumber(enteredNumber);
  }

  const handleFilteringList = (event) => {
    const enteredParameter = event.target.value;
    setFilteringParameter(enteredParameter);
  }
  
  const filterPersons = (event) => {
    event.preventDefault();
    const filteredList = persons.filter((({name}) => name.toLowerCase().includes(filteringParameter.toLowerCase())));
    setPersons(filteredList) 
  }

  const resetFilter = () => {
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
    setFilteringParameter('');
  }

  const removePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
      .remove(id)
      .then(() => {
        setPersons(persons.filter((person) => person.name !== name));
      })  
    }  
  }

  const Notification = ({ message }) => {
    if (message === null) {
      return null
    }
    
    if (message === confirmingMessage) {
      return (
        <div className='confirmingNotification'>
          {message}
        </div>
      )
    }
    return (
      <div className='unsuccessfulEvent'>
        {message}
      </div>
    )
    
  }

  return (
    <div style={{padding: 20}}>
      <h2>Phonebook</h2>
      <Notification message={confirmingMessage} />
      <Notification message={unsuccessfulEventMessage} />
      <form onSubmit={filterPersons}>
        <div>
          filter shown with: <input 
          value={filteringParameter}
          onChange={handleFilteringList}
          />
        </div>       
      </form>
      <div>
          <button onClick={() => resetFilter()} className='btn'>reset</button>
      </div> 
      <h2>Add a new person</h2>
      <form onSubmit={addPerson} name='addPerson'>
        <div>
          name: <input 
          value={newPerson}
          onChange={handlePersonChange}
          className='addNameInput'
          />
        </div>
        <br></br>
        <div>
          number: <input
          value={newNumber} 
          onChange={handleNumberChange}
          />
        </div>
        <div>
          <button type="submit" className='btn'>add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      <ul>
        {persons.map(person => 
          <>
          <Person key={person.name} person={person} />
          <button onClick={() => removePerson(person.id, person.name)} className='deleteBtn'>delete</button>
          </>
        )}
      </ul>
    </div>
  )
}

export default App
