import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { Star, CheckCircle2, Utensils, Heart, Sparkles, MessageSquareQuote, ArrowRight } from 'lucide-react';
import api from '../../../api/axios';

export const FeedbackForm = () => {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1: return { text: "Pésimo servicio", color: "#ef4444" };
      case 2: return { text: "Puede mejorar", color: "#f97316" };
      case 3: return { text: "Todo bien", color: "#eab308" };
      case 4: return { text: "Muy buena experiencia", color: "#10b981" };
      case 5: return { text: "¡Excelente! Me encantó todo", color: "#ff5722" };
      default: return { text: "Toca una estrella para calificar", color: "#94a3b8" };
    }
  };

  const activeVal = hover || rating;
  const activeLabel = getRatingLabel(activeVal);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor, toca las estrellas para elegir una calificación.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/resenas', {
        venta_id: id,
        calificacion: rating,
        comentario
      });
      setEnviado(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al enviar tu reseña.');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 text-center shadow-2xl border border-white/20 relative z-10">
          <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
            <CheckCircle2 size={56} />
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-[#ff5722] font-black text-xs uppercase tracking-wider mb-3">
            ¡SaborXpress Agradece!
          </span>

          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
            ¡Muchas Gracias!
          </h2>

          <p className="text-gray-600 leading-relaxed text-sm mb-8">
            Gracias por tus comentarios y reseñas. Tu opinión ha sido registrada exitosamente y será revisada por la gerencia para seguir mejorando. ¡Ya puedes cerrar esta pestaña de forma segura!
          </p>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-500 mb-8 flex items-center justify-center gap-2 font-medium">
            <Heart size={16} className="text-[#ff5722] fill-[#ff5722]" />
            <span>Calificación enviada para el pedido #{id}</span>
          </div>

          <Button
            size="lg"
            radius="full"
            style={{ backgroundColor: '#ff5722', color: '#fff' }}
            onPress={() => {
              try {
                window.close();
              } catch (e) {
                console.log("No se pudo cerrar automáticamente");
              }
            }}
            className="w-full font-bold shadow-xl shadow-[#ff5722]/30 hover:bg-[#e64a19] h-14 text-base"
          >
            Cerrar esta Pestaña
          </Button>

          <p className="text-[11px] text-gray-400 mt-4">
            Si tu navegador bloquea el cierre automático, puedes cerrar la pestaña manualmente en la parte superior.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">

      {/* Header de Marca */}
      <div className="flex items-center gap-3 mb-8 z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#ff5722] flex items-center justify-center text-white shadow-lg shadow-[#ff5722]/40">
          <Utensils size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-none">SaborXpress</h2>
          <span className="text-xs font-semibold text-orange-400 tracking-widest uppercase">Experiencia Gastronómica</span>
        </div>
      </div>

      {/* Tarjeta Principal */}
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/20 relative z-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-50 text-[#ff5722] font-extrabold text-xs uppercase tracking-wider mb-3 border border-orange-100">
            <Sparkles size={14} /> Opinión del Comensal
          </span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            ¿Qué tal estuvo todo?
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-1">
            Pedido / Factura #{id}
          </p>
        </div>

        {/* Estrellas Estáticas y Rápidas */}
        <div className="bg-gray-50/80 rounded-3xl p-6 mb-8 border border-gray-100 text-center">
          <div className="flex justify-center gap-2 sm:gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeVal;
              return (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={44}
                    className={`transition-colors duration-150 ${isFilled ? "text-[#f59e0b] fill-[#f59e0b] drop-shadow-sm" : "text-gray-200 fill-gray-100"
                      }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Etiqueta de Calificación */}
          <div className="h-6 flex items-center justify-center">
            <span
              className="text-sm font-black tracking-wide uppercase transition-colors duration-150"
              style={{ color: activeLabel.color }}
            >
              {activeLabel.text}
            </span>
          </div>
        </div>

        {/* Caja de Comentarios */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquareQuote size={16} className="text-[#ff5722]" /> Cuéntanos más detalles (Opcional)
          </label>
          <textarea
            placeholder="¿Qué plato te gustó más? ¿Qué podemos mejorar en nuestra atención?"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-800 text-sm font-medium placeholder-gray-400 focus:bg-white focus:border-[#ff5722] focus:outline-none focus:ring-4 focus:ring-[#ff5722]/15 transition-all resize-none shadow-sm block"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center mb-6 border border-red-100">
            {error}
          </div>
        )}

        {/* Botón de Envío Inmutable */}
        <Button
          size="lg"
          radius="full"
          style={{ backgroundColor: '#ff5722', color: '#ffffff' }}
          className="w-full font-black text-base h-14 shadow-xl shadow-[#ff5722]/30 hover:bg-[#e64a19] transition-all flex items-center justify-center gap-2"
          onPress={handleSubmit}
          isLoading={loading}
        >
          <span>Enviar Calificación</span>
          {!loading && <ArrowRight size={18} />}
        </Button>

        <p className="text-[11px] text-center text-gray-400 mt-6 font-medium">
          Tu opinión es confidencial y es revisada directamente por la gerencia del restaurante.
        </p>
      </div>

      <div className="mt-8 text-xs font-semibold text-slate-500 z-10">
        &copy; {new Date().getFullYear()} SaborXpress. Todos los derechos reservados.
      </div>
    </div>
  );
};
