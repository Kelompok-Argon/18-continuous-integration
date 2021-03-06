/** @module worker */

const { getConnection } = require('typeorm');
const { Worker } = require('./worker.model');
const bus = require('../lib/bus');

const ERROR_REGISTER_DATA_INVALID = 'data registrasi pekerja tidak lengkap';
const ERROR_WORKER_NOT_FOUND = 'pekerja tidak ditemukan';

/**
 * daftar pekerja baru
 * @param {WorkerData} data detail pekerja
 * @returns {Promise<Worker>} detail pekerja baru dengan id
 * @throws {string} saat data pekerja tidak lengkap
 */
async function register(data) {
  if (!data.name || !data.age || !data.bio || !data.address || !data.photo) {
    throw ERROR_REGISTER_DATA_INVALID;
  }
  const workerRepo = getConnection().getRepository('Worker');
  const worker = new Worker(
    null,
    data.name,
    parseInt(data.age, 10),
    data.bio,
    data.address,
    data.photo
  );
  await workerRepo.save(worker);
  bus.publish('worker.registered', worker);
  return worker;
}

/**
 * mendapatkan daftar pekerja
 * @returns {Promise<Worker[]>} daftar pekerja
 */
function list() {
  const workerRepo = getConnection().getRepository('Worker');
  return workerRepo.find();
}

/**
 * mendapatkan info detail pekerja menggunakan id
 * @param {number} id id dari pekerja
 * @returns {promise<Worker>} detail pekerja sesuai id
 * @throws {string} jika pekerja tidak ditemukan
 */
async function info(id) {
  const workerRepo = getConnection().getRepository('Worker');
  const worker = await workerRepo.findOne(id);
  if (!worker) {
    throw ERROR_WORKER_NOT_FOUND;
  }
  return worker;
}

/**
 * menghapus pekerja menggunakan idnya
 * @param {number} id id pekerja yang ingin dihapus
 * @returns {promise<Worker>} detail pekerja yang dihapus
 * @throws {string} jika pekerja tidak ditemukan
 */
async function remove(id) {
  const workerRepo = getConnection().getRepository('Worker');
  const worker = await workerRepo.findOne(id);
  if (!worker) {
    throw ERROR_WORKER_NOT_FOUND;
  }
  await workerRepo.delete(id);
  bus.publish('worker.removed', worker);
  return worker;
}

/**
 * truncate database
 * @returns {Promise<boolean>} boolean
 */
async function truncate() {
  const repository = await getConnection().getRepository('Worker'); // Get repository
  try {
    await repository.delete({}); // Clear each entity table's content
  } catch (error) {
    return false;
  }
  return true;
}

module.exports = {
  register,
  list,
  remove,
  info,
  truncate,
  ERROR_REGISTER_DATA_INVALID,
  ERROR_WORKER_NOT_FOUND,
};
