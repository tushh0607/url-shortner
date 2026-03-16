import { useState, useEffect, useContext } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import QRCodeGenerator from "qrcode";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function Dashboard() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [qrImage, setQrImage] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/my-urls`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUrls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShorten = async () => {
    if (!url || loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/shorten`,
        { originalUrl: url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUrls([res.data, ...urls]);
      setUrl("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this URL?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUrls(urls.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete URL");
    }
  };

  const handleCopy = (shortUrl, id) => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShowQR = async (urlData) => {
    setSelectedUrl(urlData);
    const qr = await QRCodeGenerator.toDataURL(urlData.shortUrl);
    setQrImage(qr);
  };

  const closeQRModal = () => {
    setSelectedUrl(null);
    setQrImage("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">
            Create and manage your shortened URLs
          </p>
        </div>

        {/* CREATE URL SECTION */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Create Short URL</h2>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="Enter long URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleShorten()}
              />
              <button
                onClick={handleShorten}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Shorten"}
              </button>
            </div>
          </div>
        </div>

        {/* URLS LIST */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              My URLs ({urls.length})
            </h2>

            {urls.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No URLs yet. Create your first one above!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Original URL</th>
                      <th>Short URL</th>
                      <th>Clicks</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urls.map((urlData) => (
                      <tr key={urlData._id}>
                        <td className="max-w-xs truncate">
                          <a
                            href={urlData.originalUrl}
                            target="_blank"
                            className="link link-primary"
                          >
                            {urlData.originalUrl}
                          </a>
                        </td>
                        <td>
                          <a
                            href={urlData.shortUrl}
                            target="_blank"
                            className="link link-secondary"
                          >
                            {urlData.shortUrl}
                          </a>
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {urlData.clicks}
                          </span>
                        </td>
                        <td>
                          {new Date(urlData.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleCopy(urlData.shortUrl, urlData._id)
                              }
                              className={`btn btn-sm ${
                                copied === urlData._id
                                  ? "btn-success"
                                  : "btn-outline"
                              }`}
                            >
                              {copied === urlData._id ? "✓" : "Copy"}
                            </button>
                            <button
                              onClick={() => handleShowQR(urlData)}
                              className="btn btn-sm btn-outline btn-info"
                            >
                              QR
                            </button>
                            <button
                              onClick={() => handleDelete(urlData._id)}
                              className="btn btn-sm btn-outline btn-error"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR CODE MODAL */}
      {selectedUrl && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">QR Code</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={selectedUrl.shortUrl} size={200} />
              </div>
              <p className="text-sm text-center break-all">
                {selectedUrl.shortUrl}
              </p>
              {qrImage && (
                <a
                  className="btn btn-primary w-full"
                  download={`qr-${selectedUrl.shortId}.png`}
                  href={qrImage}
                >
                  Download QR Code
                </a>
              )}
            </div>
            <div className="modal-action">
              <button onClick={closeQRModal} className="btn">
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeQRModal}></div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;