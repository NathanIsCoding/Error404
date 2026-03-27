import { useState } from 'react'
import './CreateJobListing.css'

function CreateJobListing({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobType, setJobType] = useState('full-time')
  const [industryInput, setIndustryInput] = useState('')
  const [salary, setSalary] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const industry = industryInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (industry.length === 0) {
      setError('Please enter at least one industry')
      setSubmitting(false)
      return
    }

    const payload = {
      title: title.trim(),
      company: company.trim(),
      jobType,
      industry,
      salary: Number(salary),
      location: location.trim(),
      description: description.trim(),
      isActive
    }

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job listing')
      }

      if (onCreated) {
        onCreated(data)
      }

      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='create-job-modal' onClick={onClose}>
      <div className='create-job-panel' onClick={(event) => event.stopPropagation()}>
        <button type='button' className='close-button' onClick={onClose}>X</button>
        <h1>Create Job Listing</h1>

        <form className='create-job-form' onSubmit={handleSubmit}>
          <label htmlFor='create-title'>Title</label>
          <input id='create-title' value={title} onChange={(event) => setTitle(event.target.value)} required />

          <label htmlFor='create-company'>Company</label>
          <input id='create-company' value={company} onChange={(event) => setCompany(event.target.value)} required />

          <label htmlFor='create-job-type'>Job Type</label>
          <select id='create-job-type' value={jobType} onChange={(event) => setJobType(event.target.value)}>
            <option value='full-time'>Full-time</option>
            <option value='part-time'>Part-time</option>
            <option value='contract'>Contract</option>
            <option value='internship'>Internship</option>
          </select>

          <label htmlFor='create-industry'>Industries (comma-separated)</label>
          <input
            id='create-industry'
            value={industryInput}
            onChange={(event) => setIndustryInput(event.target.value)}
            placeholder='tech, software'
            required
          />

          <label htmlFor='create-salary'>Salary</label>
          <input
            id='create-salary'
            type='number'
            min='1'
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            required
          />

          <label htmlFor='create-location'>Location</label>
          <input id='create-location' value={location} onChange={(event) => setLocation(event.target.value)} required />

          <label htmlFor='create-description'>Description</label>
          <textarea
            id='create-description'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            required
          />

          <label className='active-checkbox'>
            <input type='checkbox' checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Active listing
          </label>

          {error && <p className='form-error'>{error}</p>}

          <button type='submit' className='submit-job-btn' disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Job'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateJobListing
