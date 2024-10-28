import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import GaleriaAdmin from '../Components/GaleríaAdmin';
import '../styles/admin-dashboard.css';
import { SearchType, Solicitud } from '../types';
import Modal from './Modal';
import OverviewGrid from './Overview-Grid';
import UserMenu from './UserMenu';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('nombre');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todas');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'details' | 'update'>('add');
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [voluntariadoResponse, donantesResponse, adultosMayoresResponse, asociadosResponse] = await Promise.all([
          fetch('http://localhost:8080/api/voluntariado'),
          fetch('http://localhost:8080/api/donante'),
          fetch('http://localhost:8080/api/adultomayor'),
          fetch('http://localhost:8080/api/asociado'),
        ]);

        if (!voluntariadoResponse.ok) throw new Error('Error al cargar los datos de voluntariado');
        if (!donantesResponse.ok) throw new Error('Error al cargar los datos de donantes');
        if (!adultosMayoresResponse.ok) throw new Error('Error al cargar los datos de adultos mayores');
        if (!asociadosResponse.ok) throw new Error('Error al cargar los datos de asociados');

        const voluntariadoData = await voluntariadoResponse.json();
        const donantesData = await donantesResponse.json();
        const adultosMayoresData = await adultosMayoresResponse.json();
        const asociadosData = await asociadosResponse.json();

        const solicitudesVoluntariado = voluntariadoData.map((voluntariado: any) => ({
          id: voluntariado.id,
          nombre: voluntariado.nombre || 'Sin nombre',
          apellido1: voluntariado.apellido1 || 'Sin apellidos',
          apellido2: voluntariado.apellido2 || 'Sin apellidos',
          cedula: voluntariado.cedula,
          email: voluntariado.email,
          fechaNacimiento: voluntariado.fechaNacimiento || 'Fecha no disponible',
          telefono: voluntariado.telefono,
          direccion: voluntariado.direccion,
          comentarios: voluntariado.comentarios,
          tipoSolicitud: 'Voluntariado',
          estadouser: voluntariado.estadoUsuario? 'Activo' : 'Inactivo',
          estado: voluntariado.estadoAprobado ? 'Aprobada' : 'Pendiente',
        }));

        const solicitudesDonantes = donantesData.map((donante: any) => ({
          id: donante.id,
          nombre: donante.nombre,
          apellido1: donante.apellido1,
          apellido2: donante.apellido2,
          cedula: donante.cedula,
          email: donante.email,
          fechaDonacion: donante.fechaDonacion,
          telefono: donante.telefono,
          tipoDonacion: donante.tipoDonacion,
          medioDonar: donante.medioDonar,
          montoDonacion: donante.montoDonacion,
          descripDonacion: donante.descripDonacion,
          tipoSolicitud: 'Donación',
          estadouser: donante.estadoUsuario? 'Activo' : 'Inactivo',
          estado: donante.estadoAprobado ? 'Aprobada' : 'Pendiente',
        }));

        const solicitudesAdultosMayores = adultosMayoresData.map((adulto: any) => ({
          id: adulto.id,
          cedula: adulto.cedula,
          nombre: adulto.nombre || 'Sin nombre',
          apellido1: adulto.apellido1 || 'Sin apellidos',
          apellido2: adulto.apellido2 || 'Sin apellidos',
          email: adulto.email || 'Sin email',
          telefono: adulto.telefono || 'Sin teléfono',
          fechaNacimiento: adulto.fechaNacimiento,
          fechaIngreso: adulto.fechaRegistro || 'Fecha no disponible',
          genero: adulto.genero,
          patologías: adulto.patologías,
          medicamento: adulto.medicamento,
          dosis: adulto.dosis,

          cedulaEncargado: adulto.cedulaEncargado,
          nombreEncargado: adulto.nombreEncargado,
          apellido1Encargado: adulto.apellido1Encargado,
          apellido2Encargado: adulto.apellido2Encargado,
          emailEncargado: adulto.emailEncargado,
          telefonoEncargado: adulto.telefonoEncargado,
          fechaNacimientoEncargado: adulto.fechaNacimientoEncargado,
          fechaRegistro: adulto.fechaRegistro,
          generoEncargado: adulto.generoEncargado,
          tipoSolicitud: 'RegistrarAdultoMayor',
          estadouser: adulto.estadoUsuario? 'Activo' : 'Inactivo',
          estado: adulto.estadoAprobado ? 'Aprobada' : 'Pendiente',
        }));

        const solicitudesAsociados = asociadosData.map((asociado: any) => ({
          id: asociado.id,
          nombre: asociado.nombre || 'Sin nombre',
          apellido1: asociado.apellido1 || 'Sin apellidos',
          apellido2: asociado.apellido2 || 'Sin apellidos',
          cedula: asociado.cedula,
          email: asociado.email || 'Sin email',
          direccion: asociado.direccion,
          ocupacion: asociado.ocupacion,
          fecha: asociado.fecha,
          telefono: asociado.telefono || 'Sin teléfono',
          observaciones: asociado.observaciones,
          tipoSolicitud: 'Asociación',
          estadouser: asociado.estadoUsuario? 'Activo' : 'Inactivo',
          estado: asociado.estadoAprobado ? 'Aprobada' : 'Pendiente',
        }));

        setSolicitudes([
          ...solicitudesVoluntariado,
          ...solicitudesDonantes,
          ...solicitudesAdultosMayores,
          ...solicitudesAsociados,
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        toast.error('Error al cargar los datos. Inténtalo nuevamente.');
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const solicitudesPorTipo = {
    Voluntariado: solicitudes.filter(s => s.tipoSolicitud === 'Voluntariado') || [],
    Donación: solicitudes.filter(s => s.tipoSolicitud === 'Donación') || [],
    Asociación: solicitudes.filter(s => s.tipoSolicitud === 'Asociación') || [],
    RegistrarAdultoMayor: solicitudes.filter(s => s.tipoSolicitud === 'RegistrarAdultoMayor') || [],
  };

  const filteredSolicitudes = useMemo(() => {
    return solicitudes
      .filter((solicitud) => {
        if (searchType === 'cedula') {
          return solicitud.cedula?.includes(searchQuery);
        } else if (searchType === 'nombre') {
          return (
            solicitud.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            solicitud.apellido1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            solicitud.apellido2?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        return true;
      })
      .filter((solicitud) => {
        if (activeTab === 'voluntariado') return solicitud.tipoSolicitud === 'Voluntariado';
        if (activeTab === 'donaciones') return solicitud.tipoSolicitud === 'Donación';
        if (activeTab === 'asociados') return solicitud.tipoSolicitud === 'Asociación';
        if (activeTab === 'adultos-mayores') return solicitud.tipoSolicitud === 'RegistrarAdultoMayor';
        return true;
      });
  }, [solicitudes, searchType, searchQuery, activeTab]);

  
  // Agregar cabeceras de tabla para cada tipo de solicitud
  const renderTablaCabeceras = (tipo: string) => {
    switch (tipo) {
      case 'voluntariado':
        return (
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Primer apellido </th>
            <th>Segundo apellido </th>
            <th>Cédula</th>
            <th>Email</th>
            <th>Fecha nacimiento</th>
            <th>Teléfono</th>
            <th>Comentarios</th>
            <th>tipo solicitud</th>
            <th>Estado usuario</th>
            <th>Estado solicitud</th>
            <th>Acciones</th>
          </tr>
        );
      case 'donaciones':
        return (
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Primer apellido</th>
            <th>Segundo apellido </th>
            <th>Cédula</th>
            <th>Email</th>
            <th>Fecha donación</th>
            <th>Teléfono</th>
            <th>Tipo donación</th>
            <th>Medio donar</th>
            <th>Monto donación</th>
            <th>Descripción</th>
            <th>tipo solicitud</th>
            <th>Estado usuario</th>
            <th>Estado solicitud</th>
            <th>Acciones</th>
          </tr>
        );
      case 'adultos-mayores':
        return (
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Primer apellido</th>
            <th>Segundo apellido </th>
            <th>Cédula</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Fecha nacimiento</th>
            <th>Fecha registro</th>
            <th>Genero</th>
            <th>Patologías</th>
            <th>Medicamento</th>
            <th>Dosis</th>

            <th>Nombre encargado</th>
            <th>Primer apellido encargado</th>
            <th>Segundo apellido encargado</th>
            <th>Cédula</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Fecha nacimiento</th>
            <th>Genero encargado</th>
            <th>tipo solicitud</th>
            <th>Estado usuario</th>
            <th>Estado solicitud</th>
            <th>Acciones</th>
          </tr>
        );
      case 'asociados':
        return (
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Primer apellido</th>
            <th>Segundo apellido </th>
            <th>Cédula</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Ocupación</th>
            <th>Observaciones</th>
            <th>tipo solicitud</th>
            <th>Estado usuario</th>
            <th>Estado solicitud</th>
            <th>Acciones</th>
          </tr>
        );
      default:
        return null;
    }
  };

  // Renderizar las filas de cada solicitud según su tipo
  const renderFila = (solicitud: Solicitud) => {
    if (solicitud.tipoSolicitud === 'Voluntariado') {
      return (
        <tr key={solicitud.id}>
          <td>{solicitud.id}</td>
          <td>{solicitud.nombre}</td>
          <td>{solicitud.apellido1}</td>
          <td>{solicitud.apellido2}</td>
          <td>{solicitud.cedula}</td>
          <td>{solicitud.email}</td>
          <td>{solicitud.fechaNacimiento}</td>
          <td>{solicitud.telefono}</td>
          <td>{solicitud.comentarios}</td>
          <td>{solicitud.tipoSolicitud}</td>
          <td>{solicitud.estadouser}</td>
          <td>{solicitud.estado}</td>
          <td>
            <div className='button-container'>
              <button className="btn-detalles" onClick={() => openModal('details', solicitud)}>Detalles</button>
              <button className="btn-aprobar" onClick={() => handleAprobarSolicitud(solicitud.id)}>Aprobar</button>
              <button className="btn-rechazar" onClick={() => handleRechazarSolicitud(solicitud.id)}>Rechazar</button>
              <button className="btn-activo" onClick={() => handleActivaSolicitud(solicitud.id)}>Activo/a</button>
              <button className="btn-inactivo" onClick={() => handleInactivaSolicitud(solicitud.id)}>Inactivo/a</button>
            </div>
              
          </td>
        </tr>
      );
    } else if (solicitud.tipoSolicitud === 'Donación') {
      return (
        <tr key={solicitud.id}>
          <td>{solicitud.id}</td>
          <td>{solicitud.nombre}</td>
          <td>{solicitud.apellido1}</td>
          <td>{solicitud.apellido2}</td>
          <td>{solicitud.cedula}</td>
          <td>{solicitud.email}</td>
          <td>{solicitud.fechaDonacion}</td>
          <td>{solicitud.telefono}</td>
          <td>{solicitud.tipoDonacion}</td>
          <td>{solicitud.medioDonar}</td>
          <td>{solicitud.montoDonacion}</td>
          <td>{solicitud.descripDonacion}</td>
          <td>{solicitud.tipoSolicitud}</td>
          <td>{solicitud.estadouser}</td>
          <td>{solicitud.estado}</td>
          <td>
            <div className='button-container'>
              <button className="btn-detalles" onClick={() => openModal('details', solicitud)}>Detalles</button>
              <button className="btn-aprobar" onClick={() => openModal('update', solicitud)}>Aprobar</button>
              <button className="btn-rechazar" onClick={() => openModal('update', solicitud)}>Rechazar</button>
              <button className="btn-activo" onClick={() => handleActivaSolicitud(solicitud.id)}>Activo/a</button>
              <button className="btn-inactivo" onClick={() => handleInactivaSolicitud(solicitud.id)}>Inactivo/a</button>
            </div>
          </td>
        </tr>
      );
    } else if (solicitud.tipoSolicitud === 'RegistrarAdultoMayor') {
      return (
        <tr key={solicitud.id}>
          <td>{solicitud.id}</td>
          <td>{solicitud.nombre}</td>
          <td>{solicitud.apellido1}</td>
          <td>{solicitud.apellido2}</td>
          <td>{solicitud.cedula}</td>
          <td>{solicitud.email}</td>
          <td>{solicitud.telefono}</td>
          <td>{solicitud.fechaNacimiento}</td>
          <td>{solicitud.fechaRegistro}</td>
          <td>{solicitud.genero}</td>
          <td>{solicitud.patologías}</td>
          <td>{solicitud.medicamento}</td>
          <td>{solicitud.dosis}</td>


          <td>{solicitud.nombreEncargado}</td>
          <td>{solicitud.apellido1Encargado}</td>
          <td>{solicitud.apellido2Encargado}</td>
          <td>{solicitud.cedulaEncargado}</td>
          <td>{solicitud.emailEncargado}</td>
          <td>{solicitud.telefonoEncargado}</td>
          <td>{solicitud.fechaNacimientoEncargado}</td>
          <td>{solicitud.generoEncargado}</td>
          <td>{solicitud.tipoSolicitud}</td>
          <td>{solicitud.estadouser}</td>
          <td>{solicitud.estado}</td>
          
          <td>
            <div className='button-container'>
              <button className="btn-detalles" onClick={() => openModal('details', solicitud)}>Detalles</button>
              <button className="btn-aprobar" onClick={() => handleAprobarSolicitud(solicitud.id)}>Aprobar</button>
              <button className="btn-rechazar" onClick={() => handleRechazarSolicitud(solicitud.id)}>Rechazar</button>
              <button className="btn-activo" onClick={() => handleActivaSolicitud(solicitud.id)}>Activo/a</button>
              <button className="btn-inactivo" onClick={() => handleInactivaSolicitud(solicitud.id)}>Inactivo/a</button>
            </div>
          </td>

         
        </tr>
      );
    } else if (solicitud.tipoSolicitud === 'Asociación') {
      return (
        <tr key={solicitud.id}>
          <td>{solicitud.id}</td>
          <td>{solicitud.nombre}</td>
          <td>{solicitud.apellido1}</td>
          <td>{solicitud.apellido2}</td>
          <td>{solicitud.cedula}</td>
          <td>{solicitud.email}</td>
          <td>{solicitud.telefono}</td>
          <td>{solicitud.ocupacion}</td>
          <td>{solicitud.observaciones}</td>
          <td>{solicitud.tipoSolicitud}</td>
          <td>{solicitud.estadouser}</td>
          <td>{solicitud.estado}</td>
          <td>
            <div className='button-container'>
              <button className="btn-detalles" onClick={() => openModal('details', solicitud)}>Detalles</button>
              <button className="btn-aprobar" onClick={() => handleAprobarSolicitud(solicitud.id)}>Aprobar</button>
              <button className="btn-rechazar" onClick={() => handleRechazarSolicitud(solicitud.id)}>Rechazar</button>
              <button className="btn-activo" onClick={() => handleActivaSolicitud(solicitud.id)}>Activo/a</button>
              <button className="btn-inactivo" onClick={() => handleInactivaSolicitud(solicitud.id)}>Inactivo/a</button>
            </div>
          </td>
        </tr>
      );
    }
    return null;
  };

  if (loading) {
    return <div>Cargando solicitudes...</div>;
  }

  const openModal = (type: 'add' | 'details' | 'update', solicitud?: Solicitud) => {
    setModalType(type);
    setSelectedSolicitud(solicitud || null);
    setModalOpen(true);
  };

  // Función para actualizar el estado de aprobación de una solicitud
  const handleAprobarSolicitud = (id: string) => {
    const updatedSolicitudes = solicitudes.map((solicitud) => {
      if (solicitud.id === id) {
        return { ...solicitud, estado: 'Aprobada' }; // Cambiar el estado a 'Aprobada'
      }
      return solicitud;
    });
    setSolicitudes(updatedSolicitudes); // Actualiza el estado de las solicitudes
  };
  
  const handleRechazarSolicitud = (id: string) => {
    const updatedSolicitudes = solicitudes.map((solicitud) => {
      if (solicitud.id === id) {
        return { ...solicitud, estado: 'Rechazada' }; // Cambiar el estado a 'Rechazada'
      }
      return solicitud;
    });
    setSolicitudes(updatedSolicitudes); // Actualiza el estado de las solicitudes
  };



   // Función para actualizar el estado de aprobación de una solicitud
   const handleActivaSolicitud = (id: string) => {
    const updatedSolicitudes = solicitudes.map((solicitud) => {
      if (solicitud.id === id) {
        return { ...solicitud, estadouser: 'Activo' }; // Cambiar el estado a 'Aprobada'
      }
      return solicitud;
    });
    setSolicitudes(updatedSolicitudes); // Actualiza el estado de las solicitudes
  };
  
  const handleInactivaSolicitud = (id: string) => {
    const updatedSolicitudes = solicitudes.map((solicitud) => {
      if (solicitud.id === id) {
        return { ...solicitud, estadouser: 'Inactivo' }; // Cambiar el estado a 'Rechazada'
      }
      return solicitud;
    });
    setSolicitudes(updatedSolicitudes); // Actualiza el estado de las solicitudes
  };

  const handleAddSolicitud = (newSolicitud: Omit<Solicitud, 'id'>) => {
    const newId = (parseInt(solicitudes[solicitudes.length - 1].id) + 1).toString().padStart(3, '0');
    
    setSolicitudes(prevSolicitudes => [{...newSolicitud, id: newId}, ...prevSolicitudes]);
    setModalOpen(false);
  };

  const handleUpdateStatus = (updatedSolicitud: Solicitud) => {
    setSolicitudes(prevSolicitudes => 
      prevSolicitudes.map(sol => 
        sol.id === updatedSolicitud.id ? updatedSolicitud : sol
      )
    );
    setModalOpen(false);
    setSelectedSolicitud(null);
  };




  // Función para manejar la aprobación/rechazo de la solicitud
const handleSubmitModal = (updatedSolicitud: Solicitud) => {
  setSolicitudes(prevSolicitudes => 
    prevSolicitudes.map(solicitud => 
      solicitud.id === updatedSolicitud.id ? updatedSolicitud : solicitud
    )
  );
  
};
  return (
    <div className="admin-dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav>
          {[
            { icon: '📊', label: 'Dashboard', value: 'overview' },
            { icon: '📋', label: 'Todas', value: 'todas' },
            { icon: '❤️', label: 'Voluntariado', value: 'voluntariado' },
            { icon: '💰', label: 'Donaciones', value: 'donaciones' },
            { icon: '🤝', label: 'Asociados', value: 'asociados' },
            { icon: '👵', label: 'Adultos Mayores', value: 'adultos-mayores' },
            { icon: '🖼️', label: 'Galería', value: 'galeria' },
          ].map(({ icon, label, value }) => (
            <button key={value} className={activeTab === value ? 'active' : ''} onClick={() => setActiveTab(value)}>
              {icon} {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === 'overview' ? (
          <OverviewGrid solicitudesPorTipo={solicitudesPorTipo} />
        ) : activeTab === 'galeria' ? (
          <GaleriaAdmin />
        ) : (
          <>
            <header className="search-header">
              <input
                type="text"
                placeholder={`Buscar por ${searchType}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select onChange={(e) => setSearchType(e.target.value as SearchType)}>
                <option value="nombre">Nombre</option>
                <option value="cedula">Cédula</option>
                <option value="mes">Mes</option>
              </select>
              <button onClick={() => openModal('add')}>Agregar solicitud</button>
            </header>

            <section className="solicitudes-list">
              <table>
                <thead>{renderTablaCabeceras(activeTab)}</thead>
                <tbody>{filteredSolicitudes.map(renderFila)}</tbody>
              </table>
            </section>
          </>
        )}

{modalOpen && (
          <Modal
            type={modalType}
            solicitud={selectedSolicitud}
            onAdd={handleAddSolicitud}
            onUpdate={handleUpdateStatus}
            onSubmit={handleSubmitModal}
            onClose={() => setModalOpen(false)}
          />
        )}

        
      </main>

      <UserMenu />
    </div>
  );
}
