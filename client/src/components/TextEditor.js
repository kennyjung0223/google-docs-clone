import { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io } from 'socket.io-client'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Button, Container, Row } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['image', 'blockquote', 'code-block'],
  ['clean'],
]

export default function TextEditor() {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  const [prevTitle, setPrevTitle] = useState()
  const [title, setTitle] = useState()

  useEffect(() => {
    const s = io('http://localhost:3001')
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socket == null || quill == null) return

    socket.once('load-document', (document) => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit('get-document', documentId)
  }, [socket, quill, documentId])

  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta) => {
      quill.updateContents(delta)
    }

    socket.on('receive-changes', handler)

    return () => {
      socket.off('receive-changes', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return

      socket.emit('send-changes', delta)
    }

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    axios
      .get(`http://localhost:3001/documents/${documentId}`)
      .then((res) => {
        if (res.data === null) {
          setPrevTitle('Untitled Document')
          setTitle('Untitled Document')
        } else {
          setPrevTitle(res.data.title)
          setTitle(res.data.title)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }, [documentId])

  const changeTitleHandler = (e) => {
    setPrevTitle(title)
    setTitle(e.target.value)
  }

  const updateTitleHandler = () => {
    if (title === prevTitle) return

    const documentTitle = {
      title: title,
    }

    axios
      .put(`http://localhost:3001/documents/${documentId}`, documentTitle)
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return
    wrapper.innerHTML = ''

    const editor = document.createElement('div')
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    q.disable()
    q.setText('Loading...')
    setQuill(q)
  }, [])

  return (
    <Container fluid className='p-0'>
      <Row>
        <div className='text-editor-navbar'>
          <Link to='/'>
            <Button variant='outline-primary' size='lg'>
              <FontAwesomeIcon icon={faFileAlt} />
            </Button>
          </Link>
          <input
            type='text'
            className='title-input'
            defaultValue={title}
            onChange={changeTitleHandler}
            onBlur={updateTitleHandler}
          />
        </div>
      </Row>
      <Row>
        <div className='container' ref={wrapperRef}></div>
      </Row>
    </Container>
  )
}
