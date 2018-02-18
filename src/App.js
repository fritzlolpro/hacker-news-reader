import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

const defaultQuery = 'redux';
const pathBase = 'https://hn.algolia.com/api/v1';
const pathSearch = '/search';
const paramSearch = 'query=';
const paramPage = 'page=';
const url = `${pathBase}${pathSearch}?${paramSearch}${defaultQuery}&${paramPage}`

console.log(url)

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: defaultQuery,
      results: null,
      searchKey: '',
      error: null
    }
    this.setSearchTopStories = this.setSearchTopStories.bind(this)
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this)
    this.onDismiss = this
      .onDismiss
      .bind(this)

    this.onSearchChange = this
      .onSearchChange
      .bind(this)
  }
  setSearchTopStories(result) {
    const  {hits, page} = result
    const {searchKey, results} = this.state
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];


    const updatedHits = [...oldHits, ...hits]
    this.setState({
      results: {
        ...results,
        [searchKey]:{hits: updatedHits, page}}
    })
    // this.setState({result})
  }
  fetchSearchTopStories(searchTerm, page = 0) {
    fetch(`${pathBase}${pathSearch}?${paramSearch}${searchTerm}&${paramPage}${page}`).then(response => response.json()).then(result => this.setSearchTopStories(result)).catch(e => this.setState({error: e}))
  }
  componentDidMount() {
    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm})
    this.fetchSearchTopStories(searchTerm)
  }
  needToSearchTopStories = (searchTerm) => {
    return !this.state.results[searchTerm]
  }
  onDismiss(id) {
    const {searchKey, results} = this.state;
    const {hits, page} = results[searchKey]
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({results:{...results, [searchKey]: {hits:updatedHits, page}}})
  }
  onSearchChange(event) {
    this.setState({searchTerm: event.target.value})
  }
  onSearchSubmit = (e) => {
    const {searchTerm}=this.state
    this.setState({searchKey: searchTerm})
    if (this.needToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm)  
    }
    
    e.preventDefault();
  }

  render() {
    const {searchTerm, results, searchKey, error} = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0
    const list = (results && results[searchKey] && results[searchKey].hits) || []
    
    return (
    <div className='page'>
      <div className="interactions">
        <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>
          Search
        </Search>
        { error ? <div className="interactions"><p>Failed to fetch</p></div> :
          <Table list={list} onDismiss={this.onDismiss}/>
        }

      </div>
      <div className='interactions'>
        <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
        MOAR!
        </Button>
      </div>
      </div>
    );
  }
}

const Search = ({value, onChange, children, onSubmit}) => {
  return (
    <form onSubmit={onSubmit}>
      {children}
      <input type='text' value={value} onChange={onChange}/>
      <button type='submit'>{children}</button>
    </form>
  )
}

const Table = ({list, pattern, onDismiss}) => {
  return (
    <div className='table'>
      {list
        .map((item) => {
          const onHandleDismiss = () => onDismiss(item.objectID);
          return (
            <div key={item.objectID} className='table-row'>
              <span style={{width: '40%'}}>
                <a href={item.url}>{item.title}</a>
              </span>
              <span style={{width: '30%'}}>{item.author}</span>
              <span style={{width: '10%'}}>{item.num_comments}</span>
              <span style={{width: '10%'}}>{item.points}</span>
              <span style={{width: '10%'}}>
                <Button className='button-inline' onClick={onHandleDismiss} type='button'>
                  Dismiss
                </Button>
              </span>
            </div>
          )
          
        })}
    </div>
  )
}

const Button = ({
  onClick,
  children,
  className = 'just-button'
}) => {
  return (
    <button className={className} onClick={onClick} type='button'>
      {children}
    </button>
  )
}

export default App;
