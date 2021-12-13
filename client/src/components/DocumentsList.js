import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { v4 as uuidV4 } from 'uuid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { Table, Button, Image } from 'react-bootstrap'
// import 'bootstrap/dist/css/bootstrap.min.css'

export default function Home() {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    axios
      .get('http://localhost:3001/documents')
      .then((res) => {
        setDocuments(res.data)
      })
      .catch((err) => {
        console.log(err)
      })

    return () => {
      setDocuments([])
    }
  }, [])

  const deleteDocumentHandler = (e) => {
    console.log(e.target)
    axios
      .delete(`http://localhost:3001/documents/${e.target.value}`)
      .then((res) => {
        console.log(res)
        setDocuments(documents.filter((el) => el._id !== e.target.value))
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className='document-list'>
      <h2>Google Docs Clone</h2>
      <Table bordered>
        <thead>
          <tr>
            <th>Document</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document._id}>
              <td>
                <Link
                  to={`/documents/${document._id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Image src='https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_document_x16.png' />{' '}
                  {document.title}
                </Link>
              </td>
              <td>
                <Button
                  type='submit'
                  variant='outline-dark'
                  onClick={deleteDocumentHandler}
                  value={document._id}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Link to={`/documents/${uuidV4()}`}>
        <Button>Make new document</Button>
      </Link>
    </div>
  )
}
