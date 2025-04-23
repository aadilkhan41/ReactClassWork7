import styles from './styles.module.css';
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { v4 as uuidv4 } from "uuid";
import { Heading } from '../assets/Heading';
import { Bold } from '../assets/Bold';
import { Italic } from '../assets/italic';
import { Strike } from '../assets/Strike';
import { Link } from '../assets/Link';
import { Quote } from '../assets/Quote';
import { Code } from '../assets/Code';
import { Image } from '../assets/Image';
import { List } from '../assets/List';
import { OlList } from '../assets/OlList';
import { Checkbox } from '../assets/Checkbox';
import { Delete } from '../assets/Delete';

const Markpad = () => {
    const STORAGE_KEY = "markdownNotes";
    const [notes, setNotes] = useState([]);
    const [currentId, setCurrentId] = useState(null);
    const [content, setContent] = useState("");
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setNotes(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        if (currentId) {
            setNotes((prevNotes) =>
                prevNotes.map((note) =>
                    note.id === currentId ? { ...note, content } : note
                )
            );
        }
    }, [content, currentId]);

    const handleNewNote = () => {
        const newNote = {
            id: uuidv4(),
            content: "",
            timestamp: new Date().toLocaleString(),
        };
        setNotes([newNote, ...notes]);
        setCurrentId(newNote.id);
        setContent("");
        setIsPreview(false);
    };

    const handleEdit = (id) => {
        const note = notes.find((n) => n.id === id);
        if (note) {
            setCurrentId(id);
            setContent(note.content);
            setIsPreview(false);
        }
    };

    const handleDelete = (id) => {
        setNotes(notes.filter((n) => n.id !== id));
        if (currentId === id) {
            setCurrentId(null);
            setContent("");
        }
    };

    const replaceCheckboxes = (text) => {
        return text
            .replace(/-\s\[\s\]/g, "<input type='checkbox' />")
            .replace(/-\s\[\s*x\s\]/g, "<input type='checkbox' checked />")
            .replace(/~~(.*?)~~/g, "<strike>$1</strike>");
    };

    const insertAtCursor = (syntaxBefore, syntaxAfter = "") => {
        const textarea = document.querySelector("textarea");
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.slice(start, end);
        const updated =
            content.slice(0, start) +
            syntaxBefore +
            selected +
            syntaxAfter +
            content.slice(end);
        setContent(updated);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + syntaxBefore.length,
                end + syntaxBefore.length
            );
        }, 0);
    };

    return (
        <main className={styles.main}>
            <section className={styles.section} >
                <h1>MarkPad</h1>
                <button className={styles.newNote} onClick={handleNewNote}>+ New</button>
                <div className={styles.notes}>
                    {notes.length === 0 ? ( <p>No notes yet.</p>) : (
                        <ul>
                            {notes.map((note) => (
                                <li key={note.id} onClick={() => handleEdit(note.id)}>
                                    <h2>{note.content.split("\n")[0] || "Untitled"}</h2>
                                    <button className={styles.delete} onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} title="Delete Note"><Delete/></button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
            <div className={styles.editPanel}>
                <div className={styles.tools}>
                    <button className={styles.toggle} onClick={() => setIsPreview((prev) => !prev)} > {isPreview ? "Edit" : "Preview"} </button>
                    <div className={styles.toolbar} >
                        <button onClick={() => insertAtCursor("# ")}><Heading/></button>
                        <button onClick={() => insertAtCursor("**", "**")}><Bold/></button>
                        <button onClick={() => insertAtCursor("*", "*")}><Italic/></button>
                        <button onClick={() => insertAtCursor("~~", "~~")}><Strike/></button>
                        <button onClick={() => insertAtCursor("[", "](url)")}><Link/></button>
                        <button onClick={() => insertAtCursor("> ")}><Quote/></button>
                        <button onClick={() => insertAtCursor("```\n", "\n```")}><Code/></button>
                        <button onClick={() => insertAtCursor("![Alt text](", ")")}><Image/></button>
                        <button onClick={() => insertAtCursor("1. ")}><List/></button>
                        <button onClick={() => insertAtCursor("- ")}><OlList/></button>
                        <button onClick={() => insertAtCursor("- [ ] ")}><Checkbox/></button>
                    </div>
                </div>
                <div className={styles.editor}>
                    {isPreview ? (
                        <div className={styles.preview}>
                            <ReactMarkdown children={replaceCheckboxes(content)} rehypePlugins={[rehypeRaw]} />
                        </div>
                    ) : ( <textarea className={styles.textarea} value={content} onChange={(e) => setContent(e.target.value)} placeholder = "Write your note in Markdown..."/> )}
                </div>
            </div>
        </main>
    );
};

export default Markpad;