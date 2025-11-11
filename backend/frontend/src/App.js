import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [eventos, setEventos] = useState([]);
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');

  // Buscar eventos ao carregar a página
  useEffect(() => {
    buscarEventos();
  }, []);

  const buscarEventos = () => {
    axios.get('http://localhost:3001/eventos')
      .then(response => setEventos(response.data))
      .catch(error => console.error(error));
  };

  // Função para cadastrar novo evento
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/eventos', { nome, data })
      .then(() => {
        setNome('');
        setData('');
        buscarEventos(); // Atualiza a lista
      })
.catch(error => {
  console.error(error);
  alert('Erro ao cadastrar evento: ' + (error.response?.data?.message || error.message));
});

  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1>Lista de Eventos</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div>
          <label>Nome do Evento:</label><br />
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Data:</label><br />
          <input
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: 8 }}>Cadastrar</button>
      </form>
      <ul>
        {eventos.map(evento => (
          <li key={evento.id}>
            {evento.nome} - {evento.data}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
